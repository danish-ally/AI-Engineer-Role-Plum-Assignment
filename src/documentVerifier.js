const DOCUMENT_LABELS = {
  PRESCRIPTION: "doctor prescription",
  HOSPITAL_BILL: "hospital or clinic bill",
  LAB_REPORT: "diagnostic lab report",
  DIAGNOSTIC_REPORT: "diagnostic report",
  PHARMACY_BILL: "pharmacy bill",
  DENTAL_REPORT: "dental report",
  DISCHARGE_SUMMARY: "discharge summary"
};

function verifyDocuments(claim, policy, trace) {
  const requirement = policy.document_requirements[claim.treatmentType];
  if (!requirement) {
    trace.add("DocumentVerificationAgent", "FAILED", "Unsupported treatment type.", {
      treatmentType: claim.treatmentType
    });
    return {
      ok: false,
      errors: [`${claim.treatmentType} is not a supported claim type.`],
      required: [],
      present: []
    };
  }

  const present = new Set((claim.documents || []).map((doc) => doc.type));
  const missing = requirement.required.filter((type) => !present.has(type));
  const allowed = new Set([...requirement.required, ...(requirement.optional || [])]);
  const unexpected = [...present].filter((type) => !allowed.has(type));
  const unreadableRequired = (claim.documents || []).filter((doc) => requirement.required.includes(doc.type) && doc.quality === "UNREADABLE");

  if (missing.length || unexpected.length || unreadableRequired.length) {
    const messages = [];
    for (const type of missing) {
      const uploaded = [...present].map((item) => `${item} (${DOCUMENT_LABELS[item] || item})`).join(", ") || "no document";
      messages.push(`Uploaded document type: ${uploaded}. Required document type missing: ${type}. Please upload a ${DOCUMENT_LABELS[type] || type} for ${claim.treatmentType} claims.`);
    }
    for (const type of unexpected) {
      messages.push(`${DOCUMENT_LABELS[type] || type} is not accepted for ${claim.treatmentType} as a required document. Expected: ${requirement.required.join(", ")}.`);
    }
    for (const doc of unreadableRequired) {
      messages.push(`The ${DOCUMENT_LABELS[doc.type] || doc.type} (${doc.fileName || doc.id}) cannot be read. Please re-upload a clearer ${doc.type} document.`);
    }
    trace.add("DocumentVerificationAgent", "FAILED", "Claim stopped before extraction because required documents did not match policy requirements.", {
      required: requirement.required,
      optional: requirement.optional || [],
      present: [...present],
      missing,
      unexpected,
      unreadableRequired: unreadableRequired.map((doc) => ({ documentId: doc.id, type: doc.type, fileName: doc.fileName })),
      messages
    });
    return {
      ok: false,
      errors: messages,
      required: requirement.required,
      optional: requirement.optional || [],
      present: [...present]
    };
  }

  trace.add("DocumentVerificationAgent", "PASSED", "All required document types are present.", {
    required: requirement.required,
    optional: requirement.optional || [],
    present: [...present]
  });

  return {
    ok: true,
    errors: [],
    required: requirement.required,
    optional: requirement.optional || [],
    present: [...present]
  };
}

module.exports = { verifyDocuments, DOCUMENT_LABELS };
