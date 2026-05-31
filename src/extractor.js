const DOC_PATTERNS = {
  PRESCRIPTION: [/rx:/i, /diagnosis:/i, /doctor|dr\./i, /reg\.?\s*no/i],
  HOSPITAL_BILL: [/bill|receipt|invoice/i, /total amount|net amount/i, /hospital|clinic|medical centre/i],
  LAB_REPORT: [/lab|diagnostic|sample date|report date/i, /test name|result|normal range/i],
  PHARMACY_BILL: [/pharmacy|drug lic/i, /medicine|batch|mrp/i, /net amount|subtotal/i],
  DENTAL_REPORT: [/dental|tooth|root canal|scaling/i],
  DISCHARGE_SUMMARY: [/discharge summary|admission|discharge date/i]
};

function extractClaimData(claim, trace) {
  const extracted = {
    patient: {},
    diagnosis: [],
    procedures: [],
    medicines: [],
    tests: [],
    providers: [],
    documentAmounts: [],
    dates: [],
    qualityIssues: [],
    rawSignals: []
  };

  for (const doc of claim.documents || []) {
    try {
      const text = String(doc.text || contentToText(doc.content));
      const qualityScore = estimateQuality(doc, text);
      if (qualityScore < 0.65) {
        extracted.qualityIssues.push({
          documentId: doc.id,
          documentType: doc.type,
          issue: "Low readability or insufficient text",
          qualityScore
        });
      }

      const inferredType = inferDocumentType(text, doc.fileName);
      const dates = [...text.matchAll(/\b(\d{1,2}[-/ ][A-Za-z]{3,9}[-/ ]\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g)].map((m) => m[1]);
      const amounts = [...text.matchAll(/(?:total amount|net amount|subtotal|amount|amt)\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.\d{1,2})?)/gi)]
        .map((m) => Number(m[1].replace(/,/g, "")))
        .filter(Number.isFinite);

      const patientName = firstMatch(text, /(?:patient(?: name)?|name)\s*[:\-]\s*([A-Za-z ]{3,60})/i);
      const doctorName = firstMatch(text, /(Dr\.?\s+[A-Za-z ]{3,60})/i);
      const providerName = firstMatch(text, /(?:hospital|clinic|pharmacy|diagnostics|medical centre)\s*[:\-]?\s*([A-Za-z &.]{3,70})/i) || guessProvider(text);
      const diagnosis = firstMatch(text, /diagnosis\s*[:\-]\s*([A-Za-z0-9 ,().-]{3,100})/i);
      const procedure = firstMatch(text, /(?:procedure|treatment)\s*[:\-]\s*([A-Za-z0-9 ,().-]{3,100})/i);
      if (doc.content) {
        mergeStructuredContent(extracted, doc);
      }

      if (patientName) extracted.patient.name = clean(patientName);
      if (doctorName) extracted.providers.push({ role: "doctor", name: clean(doctorName) });
      if (providerName) extracted.providers.push({ role: "facility", name: clean(providerName) });
      if (diagnosis) extracted.diagnosis.push(clean(diagnosis));
      if (procedure) extracted.procedures.push(clean(procedure));
      if (dates.length) extracted.dates.push(...dates);
      if (amounts.length) extracted.documentAmounts.push(...amounts.map((amount) => ({ documentId: doc.id, documentType: doc.type, amount })));

      extracted.medicines.push(...extractLinesAfter(text, /(?:rx|medicine|medicines)\s*:/i, 6));
      extracted.tests.push(...extractTests(text));
      extracted.rawSignals.push({
        documentId: doc.id,
        declaredType: doc.type,
        inferredType,
        qualityScore,
        hasText: text.trim().length > 0,
        textLength: text.length
      });

      trace.add("ExtractionAgent", qualityScore < 0.65 ? "DEGRADED" : "PASSED", `Extracted structured fields from ${doc.type}.`, {
        documentId: doc.id,
        declaredType: doc.type,
        inferredType,
        qualityScore,
        fieldsFound: {
          patientName: Boolean(patientName),
          doctorName: Boolean(doctorName),
          providerName: Boolean(providerName),
          diagnosis: Boolean(diagnosis),
          procedure: Boolean(procedure),
          dates: dates.length,
          amounts: amounts.length
        }
      });
    } catch (error) {
      extracted.qualityIssues.push({
        documentId: doc.id,
        documentType: doc.type,
        issue: error.message
      });
      trace.add("ExtractionAgent", "DEGRADED", `Extraction failed for ${doc.type}; continuing with remaining documents.`, {
        documentId: doc.id,
        error: error.message
      });
    }
  }

  extracted.totalDocumentAmount = extracted.documentAmounts.reduce((sum, row) => sum + row.amount, 0);
  return extracted;
}

function mergeStructuredContent(extracted, doc) {
  const content = doc.content || {};
  if (content.patient_name) extracted.patient.name = content.patient_name;
  if (content.doctor_name) extracted.providers.push({ role: "doctor", name: content.doctor_name });
  if (content.hospital_name) extracted.providers.push({ role: "facility", name: content.hospital_name });
  if (content.diagnosis) extracted.diagnosis.push(content.diagnosis);
  if (content.treatment) extracted.procedures.push(content.treatment);
  if (content.test_name) extracted.tests.push(content.test_name);
  if (Array.isArray(content.tests_ordered)) extracted.tests.push(...content.tests_ordered);
  if (Array.isArray(content.medicines)) extracted.medicines.push(...content.medicines);
  if (content.date) extracted.dates.push(content.date);
  if (Number.isFinite(Number(content.total))) {
    extracted.documentAmounts.push({ documentId: doc.id, documentType: doc.type, amount: Number(content.total) });
  }
  if (Array.isArray(content.line_items)) {
    extracted.lineItems = extracted.lineItems || [];
    extracted.lineItems.push(...content.line_items.map((item) => ({
      documentId: doc.id,
      documentType: doc.type,
      description: item.description,
      amount: Number(item.amount || 0)
    })));
  }
}

function contentToText(content) {
  if (!content) return "";
  const lines = [];
  for (const [key, value] of Object.entries(content)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: ${value.map((item) => typeof item === "object" ? Object.values(item).join(" ") : item).join(" ")}`);
    } else if (value && typeof value === "object") {
      lines.push(`${key}: ${Object.values(value).join(" ")}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  return lines.join("\n");
}

function firstMatch(text, regex) {
  const match = text.match(regex);
  return match ? match[1] : "";
}

function clean(value) {
  return String(value).replace(/\s+/g, " ").replace(/[|]+$/g, "").trim();
}

function estimateQuality(doc, text) {
  if (doc.quality === "UNREADABLE") return 0.35;
  if (doc.quality === "LOW") return 0.55;
  if (!text || text.trim().length < 20) return 0.45;
  if (/\?\?\?|illegible|blurred/i.test(text)) return 0.5;
  return 0.88;
}

function inferDocumentType(text, fileName = "") {
  const haystack = `${fileName}\n${text}`;
  for (const [type, patterns] of Object.entries(DOC_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(haystack))) return type;
  }
  return "UNKNOWN";
}

function guessProvider(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.find((line) => /(hospital|clinic|pharmacy|diagnostics|medical centre)/i.test(line)) || "";
}

function extractLinesAfter(text, marker, maxLines) {
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex((line) => marker.test(line));
  if (index === -1) return [];
  return lines.slice(index + 1, index + 1 + maxLines)
    .map(clean)
    .filter((line) => line && !/total|subtotal|signature|stamp/i.test(line));
}

function extractTests(text) {
  const knownTests = ["CBC", "Dengue NS1", "MRI", "CT Scan", "PET Scan", "Eye Examination", "Dental X-Ray"];
  return knownTests.filter((test) => new RegExp(test.replace(/\s+/g, "\\s+"), "i").test(text));
}

module.exports = { extractClaimData, inferDocumentType };
