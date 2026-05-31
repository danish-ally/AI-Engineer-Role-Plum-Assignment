const { extractWithAIContract } = require("./aiExtractionAdapter");

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
      const aiResult = extractWithAIContract(doc, text, {
        inferDocumentType,
        estimateQuality,
        firstMatch,
        guessProvider,
        extractLinesAfter,
        extractTests
      });
      const aiExtraction = aiResult.extraction;
      const qualityScore = aiExtraction.quality.score;
      if (qualityScore < 0.65) {
        extracted.qualityIssues.push({
          documentId: doc.id,
          documentType: doc.type,
          issue: "Low readability or insufficient text",
          qualityScore
        });
      }

      mergeAIExtraction(extracted, aiExtraction);
      extracted.rawSignals.push({
        documentId: doc.id,
        declaredType: doc.type,
        inferredType: aiExtraction.inferredType,
        qualityScore,
        extractionConfidence: aiExtraction.confidence,
        schemaVersion: aiExtraction.schemaVersion,
        schemaValidated: aiResult.ok,
        validationErrors: aiResult.errors,
        hasText: text.trim().length > 0,
        textLength: text.length
      });

      trace.add("AIExtractionAdapter", aiResult.ok ? "PASSED" : "DEGRADED", `Schema-guided extraction completed for ${doc.type}.`, {
        documentId: doc.id,
        schemaVersion: aiExtraction.schemaVersion,
        mode: aiResult.mode,
        confidence: aiExtraction.confidence,
        fallbackUsed: aiResult.fallbackUsed,
        validationErrors: aiResult.errors
      });

      trace.add("ExtractionAgent", qualityScore < 0.65 ? "DEGRADED" : "PASSED", `Extracted structured fields from ${doc.type}.`, {
        documentId: doc.id,
        declaredType: doc.type,
        inferredType: aiExtraction.inferredType,
        qualityScore,
        fieldsFound: {
          patientName: Boolean(aiExtraction.patient.name),
          providers: aiExtraction.providers.length,
          diagnosis: aiExtraction.diagnosis.length,
          procedure: aiExtraction.procedures.length,
          dates: aiExtraction.dates.length,
          amounts: aiExtraction.amounts.length,
          lineItems: aiExtraction.lineItems.length
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

function mergeAIExtraction(extracted, aiExtraction) {
  if (aiExtraction.patient.name) extracted.patient.name = aiExtraction.patient.name;
  extracted.providers.push(...aiExtraction.providers);
  extracted.diagnosis.push(...aiExtraction.diagnosis);
  extracted.procedures.push(...aiExtraction.procedures);
  extracted.medicines.push(...aiExtraction.medicines);
  extracted.tests.push(...aiExtraction.tests);
  extracted.dates.push(...aiExtraction.dates);
  extracted.documentAmounts.push(...aiExtraction.amounts);
  extracted.lineItems = extracted.lineItems || [];
  extracted.lineItems.push(...aiExtraction.lineItems);
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
