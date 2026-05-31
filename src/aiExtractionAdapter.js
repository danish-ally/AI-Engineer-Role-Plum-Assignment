const EXTRACTION_SCHEMA_VERSION = "medical-claim-extraction.v1";

const DOCUMENT_EXTRACTION_SCHEMA = {
  schemaVersion: EXTRACTION_SCHEMA_VERSION,
  fields: {
    documentId: "string",
    declaredType: "string",
    inferredType: "string",
    patient: "object",
    providers: "array",
    diagnosis: "array",
    procedures: "array",
    medicines: "array",
    tests: "array",
    amounts: "array",
    dates: "array",
    lineItems: "array",
    quality: "object",
    confidence: "number"
  }
};

function extractWithAIContract(doc, text, helpers = {}) {
  const inferredType = helpers.inferDocumentType ? helpers.inferDocumentType(text, doc.fileName) : doc.type;
  const qualityScore = helpers.estimateQuality ? helpers.estimateQuality(doc, text) : 0.75;
  const content = doc.content || {};

  const extraction = {
    schemaVersion: EXTRACTION_SCHEMA_VERSION,
    documentId: doc.id,
    declaredType: doc.type,
    inferredType,
    patient: {
      name: content.patient_name || helpers.firstMatch?.(text, /(?:patient(?: name)?|name)\s*[:\-]\s*([A-Za-z ]{3,60})/i) || doc.patientNameOnDoc || null
    },
    providers: buildProviders(content, text, helpers),
    diagnosis: compact([content.diagnosis || helpers.firstMatch?.(text, /diagnosis\s*[:\-]\s*([A-Za-z0-9 ,().-]{3,100})/i)]),
    procedures: compact([content.treatment || helpers.firstMatch?.(text, /(?:procedure|treatment)\s*[:\-]\s*([A-Za-z0-9 ,().-]{3,100})/i)]),
    medicines: Array.isArray(content.medicines) ? content.medicines : helpers.extractLinesAfter?.(text, /(?:rx|medicine|medicines)\s*:/i, 6) || [],
    tests: extractTests(content, text, helpers),
    amounts: extractAmounts(content, text, doc),
    dates: extractDates(content, text),
    lineItems: extractLineItems(content, doc),
    quality: {
      score: qualityScore,
      issue: qualityScore < 0.65 ? "Low readability or insufficient text" : null
    },
    confidence: calculateExtractionConfidence(qualityScore, content, text),
    promptContract: buildExtractionPrompt(doc, text)
  };

  const validation = validateExtraction(extraction);
  return {
    ok: validation.ok,
    extraction,
    errors: validation.errors,
    mode: "schema_guided_ai_adapter",
    fallbackUsed: false
  };
}

function buildExtractionPrompt(doc, text) {
  return {
    system: [
      "You are a medical claims extraction agent for Indian OPD insurance documents.",
      "Return only JSON that matches the extraction schema.",
      "Use null for missing fields and include confidence based on readability.",
      "Never make a claim decision; only extract document facts."
    ].join(" "),
    user: {
      schemaVersion: EXTRACTION_SCHEMA_VERSION,
      declaredType: doc.type,
      fileName: doc.fileName || null,
      textPreview: String(text || "").slice(0, 1800),
      expectedOutputShape: DOCUMENT_EXTRACTION_SCHEMA.fields
    }
  };
}

function validateExtraction(extraction) {
  const errors = [];
  if (extraction.schemaVersion !== EXTRACTION_SCHEMA_VERSION) errors.push("schemaVersion mismatch");
  if (!extraction.documentId) errors.push("documentId is required");
  if (!extraction.declaredType) errors.push("declaredType is required");
  if (!Number.isFinite(extraction.confidence)) errors.push("confidence must be numeric");
  for (const key of ["providers", "diagnosis", "procedures", "medicines", "tests", "amounts", "dates", "lineItems"]) {
    if (!Array.isArray(extraction[key])) errors.push(`${key} must be an array`);
  }
  return { ok: errors.length === 0, errors };
}

function buildProviders(content, text, helpers) {
  const providers = [];
  const doctorName = content.doctor_name || helpers.firstMatch?.(text, /(Dr\.?\s+[A-Za-z ]{3,60})/i);
  const facilityName = content.hospital_name || helpers.guessProvider?.(text);
  if (doctorName) providers.push({ role: "doctor", name: clean(doctorName), registration: content.doctor_registration || null });
  if (facilityName) providers.push({ role: "facility", name: clean(facilityName) });
  return providers;
}

function extractTests(content, text, helpers) {
  const tests = [];
  if (content.test_name) tests.push(content.test_name);
  if (Array.isArray(content.tests_ordered)) tests.push(...content.tests_ordered);
  if (helpers.extractTests) tests.push(...helpers.extractTests(text));
  return unique(compact(tests));
}

function extractAmounts(content, text, doc) {
  const amounts = [];
  if (Number.isFinite(Number(content.total))) {
    amounts.push({ documentId: doc.id, documentType: doc.type, amount: Number(content.total), source: "content.total" });
  }
  const textAmounts = [...String(text || "").matchAll(/(?:total amount|net amount|subtotal|amount|amt)\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.\d{1,2})?)/gi)]
    .map((match) => Number(match[1].replace(/,/g, "")))
    .filter(Number.isFinite);
  amounts.push(...textAmounts.map((amount) => ({ documentId: doc.id, documentType: doc.type, amount, source: "ocr_text" })));
  return amounts;
}

function extractDates(content, text) {
  const dates = [];
  if (content.date) dates.push(content.date);
  dates.push(...[...String(text || "").matchAll(/\b(\d{1,2}[-/ ][A-Za-z]{3,9}[-/ ]\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g)].map((m) => m[1]));
  return unique(compact(dates));
}

function extractLineItems(content, doc) {
  if (!Array.isArray(content.line_items)) return [];
  return content.line_items.map((item) => ({
    documentId: doc.id,
    documentType: doc.type,
    description: item.description,
    amount: Number(item.amount || 0)
  }));
}

function calculateExtractionConfidence(qualityScore, content, text) {
  let confidence = qualityScore;
  if (Object.keys(content || {}).length > 0) confidence += 0.08;
  if (String(text || "").length < 20) confidence -= 0.12;
  return Math.max(0.25, Math.min(0.98, Number(confidence.toFixed(2))));
}

function compact(values) {
  return values.filter((value) => value !== null && value !== undefined && String(value).trim() !== "").map(clean);
}

function unique(values) {
  return [...new Set(values)];
}

function clean(value) {
  if (typeof value === "object") return value;
  return String(value).replace(/\s+/g, " ").replace(/[|]+$/g, "").trim();
}

module.exports = {
  DOCUMENT_EXTRACTION_SCHEMA,
  EXTRACTION_SCHEMA_VERSION,
  buildExtractionPrompt,
  extractWithAIContract,
  validateExtraction
};
