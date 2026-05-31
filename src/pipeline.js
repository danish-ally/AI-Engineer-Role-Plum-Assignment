const { loadPolicy } = require("./dataAccess");
const { createTrace } = require("./trace");
const { verifyDocuments } = require("./documentVerifier");
const { extractClaimData } = require("./extractor");
const { evaluatePolicy, decideClaim } = require("./policyEngine");

function processClaim(input, injectedPolicy) {
  const policy = injectedPolicy || loadPolicy();
  const trace = createTrace();
  const claim = normalizeClaim(input);

  trace.add("IntakeAgent", "PASSED", "Claim intake normalized.", {
    claimId: claim.claimId,
    memberId: claim.memberId,
    treatmentType: claim.treatmentType,
    claimedAmount: claim.claimedAmount,
    documentCount: claim.documents.length
  });

  const verification = verifyDocuments(claim, policy, trace);
  if (!verification.ok) {
    const output = {
      claimId: claim.claimId,
      decision: null,
      status: "ACTION_REQUIRED",
      approvedAmount: 0,
      reason: verification.errors.join(" "),
      confidence: 0.96,
      verification,
      extracted: null,
      checks: [],
      trace: trace.all()
    };
    trace.add("DecisionAgent", "PASSED", "Claim stopped before decision because member action is required.", {
      decision: output.decision,
      reason: output.reason
    });
    output.trace = trace.all();
    return output;
  }

  const extracted = extractClaimData(claim, trace);
  const consistency = validateDocumentConsistency(claim, extracted, trace);
  if (!consistency.ok) {
    return {
      claimId: claim.claimId,
      decision: null,
      status: "ACTION_REQUIRED",
      approvedAmount: 0,
      reason: consistency.errors.join(" "),
      confidence: 0.94,
      verification,
      extracted,
      checks: [],
      trace: trace.all()
    };
  }

  if (claim.simulateComponentFailure) {
    trace.add("ExtractionAgent", "DEGRADED", "Simulated extraction sub-component failure; continuing with structured document content and reduced confidence.", {
      recommendation: "Manual review recommended because processing was incomplete."
    });
  }

  const evaluation = evaluatePolicy(claim, extracted, policy, trace);
  const decision = decideClaim(claim, extracted, evaluation, policy, trace);

  return {
    claimId: claim.claimId,
    ...decision,
    verification,
    extracted,
    checks: evaluation.checks,
    trace: trace.all()
  };
}

function normalizeClaim(input) {
  const source = input.input || input;
  return {
    claimId: source.claimId || source.claim_id || input.case_id || `CLM-${Date.now()}`,
    memberId: source.memberId || source.member_id,
    policyId: source.policy_id,
    treatmentType: String(source.treatmentType || source.claim_category || "").toUpperCase(),
    claimedAmount: Number(source.claimedAmount || source.claimed_amount || 0),
    ytdClaimsAmount: Number(source.ytd_claims_amount || source.ytdClaimsAmount || 0),
    treatmentDate: source.treatmentDate || source.treatment_date,
    submissionDate: source.submissionDate || source.submission_date || source.treatmentDate || source.treatment_date || new Date().toISOString().slice(0, 10),
    diagnosis: source.diagnosis || "",
    notes: source.notes || "",
    hospitalName: source.hospitalName || source.hospital_name || "",
    claimsHistory: source.claimsHistory || source.claims_history || [],
    preAuthorized: Boolean(source.preAuthorized || source.pre_authorized),
    simulateComponentFailure: Boolean(source.simulateComponentFailure || source.simulate_component_failure),
    documents: (source.documents || []).map((doc, index) => ({
      id: doc.id || doc.file_id || `doc-${index + 1}`,
      type: String(doc.type || doc.actual_type || "").toUpperCase(),
      fileName: doc.fileName || doc.file_name || "",
      patientNameOnDoc: doc.patient_name_on_doc || "",
      content: doc.content || null,
      text: doc.text || "",
      quality: doc.quality || "GOOD"
    }))
  };
}

function validateDocumentConsistency(claim, extracted, trace) {
  const patientNames = (claim.documents || [])
    .map((doc) => doc.patientNameOnDoc || (doc.content && doc.content.patient_name))
    .filter(Boolean);
  const uniqueNames = [...new Set(patientNames.map((name) => name.trim()))];

  if (uniqueNames.length > 1) {
    const errors = [`Documents appear to belong to different patients: ${uniqueNames.join(", ")}. Please upload documents for the same patient.`];
    trace.add("ConsistencyAgent", "FAILED", "Documents belong to different patients.", {
      patientNamesByDocument: claim.documents.map((doc) => ({
        documentId: doc.id,
        documentType: doc.type,
        patientName: doc.patientNameOnDoc || (doc.content && doc.content.patient_name) || null
      })),
      errors
    });
    return { ok: false, errors };
  }

  trace.add("ConsistencyAgent", "PASSED", "Document patient identity checks passed.", {
    patientNames: uniqueNames
  });
  return { ok: true, errors: [] };
}

module.exports = { processClaim, normalizeClaim };
