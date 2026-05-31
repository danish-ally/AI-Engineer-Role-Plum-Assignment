const TREATMENT_TO_CATEGORY = {
  CONSULTATION: "consultation",
  DIAGNOSTIC: "diagnostic",
  PHARMACY: "pharmacy",
  DENTAL: "dental",
  VISION: "vision",
  ALTERNATIVE_MEDICINE: "alternative_medicine"
};

function evaluatePolicy(claim, extracted, policy, trace) {
  const checks = [];
  const categoryKey = TREATMENT_TO_CATEGORY[claim.treatmentType];
  const category = policy.opd_categories[categoryKey];
  const member = policy.members.find((row) => row.member_id === claim.memberId);

  addCheck(checks, "member_eligibility", Boolean(member), member ? "Member exists in policy roster." : "Member ID not found in policy roster.", { memberId: claim.memberId });
  if (member) {
    const treatmentDate = parseDate(claim.treatmentDate);
    const joinDate = parseDate(member.join_date);
    const daysSinceJoin = differenceInDays(treatmentDate, joinDate);
    addCheck(checks, "initial_waiting_period", daysSinceJoin >= policy.waiting_periods.initial_waiting_period_days, `Member has ${daysSinceJoin} days since join; policy requires ${policy.waiting_periods.initial_waiting_period_days}.`, { daysSinceJoin });
  }

  addCheck(checks, "category_covered", Boolean(category && category.covered), category && category.covered ? `${claim.treatmentType} is covered.` : `${claim.treatmentType} is not covered.`, { categoryKey });

  const claimAmount = Number(claim.claimedAmount || 0);
  addCheck(checks, "minimum_claim_amount", claimAmount >= policy.submission_rules.minimum_claim_amount, `Claimed amount is ${claimAmount}; minimum is ${policy.submission_rules.minimum_claim_amount}.`);
  if (claim.treatmentType !== "DENTAL") {
    addCheck(checks, "per_claim_limit", claimAmount <= policy.coverage.per_claim_limit, `Claimed amount ${claimAmount} exceeds per-claim limit ${policy.coverage.per_claim_limit}.`);
  }

  const treatmentDate = parseDate(claim.treatmentDate);
  const submissionDate = parseDate(claim.submissionDate || new Date().toISOString().slice(0, 10));
  const daysToSubmit = differenceInDays(submissionDate, treatmentDate);
  addCheck(checks, "submission_deadline", daysToSubmit <= policy.submission_rules.deadline_days_from_treatment, `Submitted ${daysToSubmit} days after treatment; allowed ${policy.submission_rules.deadline_days_from_treatment}.`, { daysToSubmit });

  if (category && !["CONSULTATION"].includes(claim.treatmentType)) {
    addCheck(checks, "category_sub_limit", claimAmount <= category.sub_limit, `Claimed amount ${claimAmount} checked against ${categoryKey} sub-limit ${category.sub_limit}.`, { subLimit: category.sub_limit });
  }

  applyExclusionChecks(claim, extracted, policy, checks);
  applySpecificCategoryChecks(claim, extracted, policy, category, checks);
  applyFraudChecks(claim, policy, checks);

  const failed = checks.filter((check) => check.status === "FAILED");
  const warnings = checks.filter((check) => check.status === "WARN");
  trace.add("PolicyEvaluationAgent", failed.length ? "FAILED" : warnings.length ? "WARN" : "PASSED", "Policy checks completed.", {
    passed: checks.filter((check) => check.status === "PASSED").length,
    failed: failed.length,
    warnings: warnings.length,
    checks
  });

  return { checks, categoryKey, category, member };
}

function decideClaim(claim, extracted, evaluation, policy, trace) {
  const hardFailures = evaluation.checks.filter((check) => check.status === "FAILED");
  const amountLimitFailures = evaluation.checks.filter((check) => check.status === "FAILED" && ["category_sub_limit"].includes(check.name));
  const manualSignals = evaluation.checks.filter((check) => check.status === "WARN");
  const claimAmount = Number(claim.claimedAmount || 0);
  const category = evaluation.category || {};

  let approvedAmount = 0;
  let decision = "APPROVED";
  let reason = "All required policy checks passed.";

  const dentalLineDecision = claim.treatmentType === "DENTAL" ? decideDentalLineItems(extracted, evaluation.category) : null;

  if (dentalLineDecision && dentalLineDecision.approvedAmount > 0 && dentalLineDecision.rejectedItems.length > 0) {
    decision = "PARTIAL";
    approvedAmount = dentalLineDecision.approvedAmount;
    reason = `Approved covered dental items and rejected excluded items: ${dentalLineDecision.rejectedItems.map((item) => `${item.description} (${item.reason})`).join(", ")}.`;
  } else if (hardFailures.length) {
    decision = "REJECTED";
    reason = hardFailures.map((check) => check.message).join(" ");
  } else if (claimAmount > policy.fraud_thresholds.auto_manual_review_above || manualSignals.some((check) => check.manualReview)) {
    decision = "MANUAL_REVIEW";
    reason = manualSignals.map((check) => check.message).join(" ") || "Claim requires manual review under fraud/pre-authorization thresholds.";
  } else {
    const payableBase = claim.treatmentType === "DENTAL" || claim.treatmentType === "CONSULTATION"
      ? Math.min(claimAmount, category.sub_limit || claimAmount)
      : Math.min(claimAmount, policy.coverage.per_claim_limit, category.sub_limit || claimAmount);
    const limitedPayableBase = claim.treatmentType === "CONSULTATION"
      ? Math.min(claimAmount, policy.coverage.per_claim_limit)
      : payableBase;
    approvedAmount = applyCopay(limitedPayableBase, claim, extracted, category);
    if (amountLimitFailures.length) {
      decision = "PARTIAL";
      reason = amountLimitFailures.map((check) => check.message).join(" ") || "Policy copay or sub-limit reduced payable amount.";
    }
  }

  if (claim.simulateComponentFailure && decision === "APPROVED") {
    reason = `${reason} Manual review is recommended because one processing component was skipped.`;
  }

  const confidence = calculateConfidence(decision, extracted, evaluation, trace);
  trace.add("DecisionAgent", "PASSED", `Final decision: ${decision}.`, {
    decision,
    approvedAmount,
    confidence,
    reason
  });

  return {
    decision,
    approvedAmount: Math.round(approvedAmount),
    reason,
    confidence
  };
}

function addCheck(checks, name, passed, message, details = {}) {
  checks.push({
    name,
    status: passed ? "PASSED" : "FAILED",
    message,
    details
  });
}

function addWarn(checks, name, message, details = {}, manualReview = true) {
  checks.push({
    name,
    status: "WARN",
    message,
    details,
    manualReview
  });
}

function parseDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date("Invalid") : date;
}

function differenceInDays(later, earlier) {
  if (Number.isNaN(later.getTime()) || Number.isNaN(earlier.getTime())) return 9999;
  return Math.floor((later - earlier) / (24 * 60 * 60 * 1000));
}

function applyExclusionChecks(claim, extracted, policy, checks) {
  const text = combinedText(claim, extracted);
  const exclusions = [
    ...policy.exclusions.conditions,
    ...policy.exclusions.dental_exclusions,
    ...policy.exclusions.vision_exclusions
  ];
  const matched = exclusions.find((item) => exclusionMatches(text, item));
  addCheck(checks, "exclusion_screen", !matched, matched ? `Claim appears related to excluded item: ${matched}.` : "No configured exclusion matched extracted text.", { matched });
}

function applySpecificCategoryChecks(claim, extracted, policy, category, checks) {
  const text = combinedText(claim, extracted);
  const diagnosisText = normalize(extracted.diagnosis.join(" "));
  const treatmentDays = differenceInDays(parseDate(claim.treatmentDate), parseDate((policy.members.find((row) => row.member_id === claim.memberId) || {}).join_date));

  for (const [condition, days] of Object.entries(policy.waiting_periods.specific_conditions)) {
    const compact = condition.replace(/_/g, " ");
    const conditionMatched = (condition !== "hernia" && diagnosisText.includes(compact))
      || (condition === "diabetes" && (diagnosisText.includes("diabetes") || diagnosisText.includes("t2dm")))
      || (condition === "hypertension" && (diagnosisText.includes("hypertension") || diagnosisText.includes("htn")))
      || (condition === "hernia" && /\bhernia\b/.test(diagnosisText));
    if (conditionMatched) {
      const eligibleFrom = new Date(parseDate((policy.members.find((row) => row.member_id === claim.memberId) || {}).join_date).getTime() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      addCheck(checks, `waiting_period_${condition}`, treatmentDays >= days, `${compact} waiting period requires ${days} days; member has ${treatmentDays}. Eligible from ${eligibleFrom}.`, { condition, requiredDays: days, treatmentDays, eligibleFrom });
    }
  }

  if (claim.treatmentType === "DIAGNOSTIC") {
    const needsPreAuth = (extracted.tests || []).some((test) => category.high_value_tests_requiring_pre_auth.some((item) => normalize(item) === normalize(test))) && Number(claim.claimedAmount) > category.pre_auth_threshold;
    if (needsPreAuth && !claim.preAuthorized) {
      addCheck(checks, "pre_authorization", false, "High-value diagnostic test requires pre-authorization but none was supplied. Please resubmit with a valid pre-authorization approval.", { tests: extracted.tests, threshold: category.pre_auth_threshold });
    } else {
      addCheck(checks, "pre_authorization", true, "No missing pre-authorization requirement detected.", { tests: extracted.tests });
    }
  }

  if (claim.treatmentType === "DENTAL") {
    const covered = (category.covered_procedures || []).some((item) => normalize(text).includes(normalize(item)));
    const excluded = (category.excluded_procedures || []).some((item) => normalize(text).includes(normalize(item)));
    addCheck(checks, "dental_procedure", covered, covered ? "At least one dental line item is covered." : "Dental procedure is not in covered dental procedures.", { covered, excluded });
  }

  if (claim.treatmentType === "VISION") {
    const covered = (category.covered_items || []).some((item) => normalize(text).includes(normalize(item)));
    const excluded = (category.excluded_items || []).some((item) => normalize(text).includes(normalize(item)));
    addCheck(checks, "vision_item", covered && !excluded, covered && !excluded ? "Vision item is covered." : "Vision item is not covered or matches vision exclusions.", { covered, excluded });
  }

  if (claim.treatmentType === "ALTERNATIVE_MEDICINE") {
    const systemCovered = (category.covered_systems || []).some((item) => normalize(text).includes(normalize(item))) || /AYUR\//i.test(text);
    const registered = /reg\.?\s*no|registration|AYUR\//i.test(text);
    addCheck(checks, "alternative_system", systemCovered, systemCovered ? "Alternative medicine system is covered." : "Alternative medicine system was not recognized as covered.", { coveredSystems: category.covered_systems });
    addCheck(checks, "registered_practitioner", registered, registered ? "Practitioner registration was found." : "Registered practitioner details were not found.");
  }

  if (extracted.qualityIssues.length) {
    addWarn(checks, "document_quality", "One or more documents had low readability; confidence reduced.", { qualityIssues: extracted.qualityIssues }, false);
  }
}

function applyCopay(amount, claim, extracted, category) {
  let payable = amount;
  const networkDiscount = category.network_discount_percent || 0;
  if (networkDiscount && isNetworkProvider(claim, extracted)) {
    payable = payable * (1 - networkDiscount / 100);
  }
  if (category.copay_percent) {
    payable = payable * (1 - category.copay_percent / 100);
  }
  if (claim.treatmentType === "PHARMACY" && /branded/i.test(combinedText(claim, extracted))) {
    payable = payable * (1 - (category.branded_drug_copay_percent || 0) / 100);
  }
  return payable;
}

function calculateConfidence(decision, extracted, evaluation, trace) {
  let confidence = decision === "MANUAL_REVIEW" ? 0.62 : 0.9;
  if (decision === "REJECTED" && evaluation.checks.some((check) => check.name === "exclusion_screen")) confidence = 0.94;
  confidence -= extracted.qualityIssues.length * 0.1;
  confidence -= evaluation.checks.filter((check) => check.status === "WARN").length * 0.06;
  confidence -= trace.hasWarning() ? 0.12 : 0;
  confidence -= trace.hasFailure() && decision !== "REJECTED" ? 0.08 : 0;
  return Math.max(0.35, Math.min(0.98, Number(confidence.toFixed(2))));
}

function combinedText(claim, extracted) {
  return [
    claim.diagnosis || "",
    claim.notes || "",
    claim.hospitalName || "",
    extracted.diagnosis.join(" "),
    extracted.procedures.join(" "),
    extracted.medicines.join(" "),
    extracted.tests.join(" "),
    extracted.providers.map((provider) => provider.name).join(" "),
    (extracted.lineItems || []).map((item) => item.description).join(" "),
    ...(claim.documents || []).map((doc) => doc.text || stringifyContent(doc.content))
  ].join(" ");
}

function stringifyContent(content) {
  if (!content) return "";
  return JSON.stringify(content);
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

function keywordOverlap(text, phrase) {
  const normalizedText = normalize(text);
  return normalize(phrase).split(" ").filter((word) => word.length > 3).some((word) => normalizedText.includes(word));
}

function exclusionMatches(text, exclusion) {
  const normalizedText = normalize(text);
  const normalizedExclusion = normalize(exclusion);
  const aliases = {
    "health supplements and tonics": ["health supplement", "health supplements", "tonic", "tonics"],
    "cosmetic or aesthetic procedures": ["cosmetic procedure", "aesthetic procedure"],
    "cosmetic dental procedures": ["cosmetic dental"],
    "orthodontic treatment": ["orthodontic treatment", "braces"],
    "orthodontic treatment braces": ["orthodontic treatment", "braces"],
    "lasik": ["lasik"],
    "refractive surgery": ["refractive surgery"],
    "teeth whitening": ["teeth whitening"],
    "bariatric surgery": ["bariatric surgery"],
    "obesity and weight loss programs": ["obesity", "weight loss program", "diet program", "nutrition program"],
    "vaccination non medically necessary": ["non medically necessary vaccination", "non medical vaccination"]
  };
  const candidates = aliases[normalizedExclusion] || [normalizedExclusion];
  if (candidates.some((candidate) => normalizedText.includes(candidate))) return true;
  return false;
}

function applyFraudChecks(claim, policy, checks) {
  const sameDayClaims = (claim.claimsHistory || []).filter((row) => row.date === claim.treatmentDate);
  if (sameDayClaims.length >= policy.fraud_thresholds.same_day_claims_limit) {
    addWarn(checks, "same_day_claim_pattern", `Member already has ${sameDayClaims.length} claims on ${claim.treatmentDate}; this exceeds same-day claim threshold ${policy.fraud_thresholds.same_day_claims_limit}.`, {
      sameDayClaims
    });
  }
}

function decideDentalLineItems(extracted, category) {
  const lineItems = extracted.lineItems || [];
  if (!lineItems.length || !category) return null;
  const approvedItems = [];
  const rejectedItems = [];
  for (const item of lineItems) {
    const description = normalize(item.description);
    const isCovered = (category.covered_procedures || []).some((procedure) => description.includes(normalize(procedure)));
    const isExcluded = (category.excluded_procedures || []).some((procedure) => description.includes(normalize(procedure)));
    if (isCovered && !isExcluded) {
      approvedItems.push(item);
    } else if (isExcluded) {
      rejectedItems.push({ ...item, reason: "Cosmetic dental procedure is excluded" });
    }
  }
  return {
    approvedAmount: approvedItems.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    approvedItems,
    rejectedItems
  };
}

function isNetworkProvider(claim, extracted) {
  const providers = [
    claim.hospitalName,
    ...(extracted.providers || []).map((provider) => provider.name)
  ].join(" ");
  return /apollo hospitals|fortis healthcare|max healthcare|manipal hospitals|narayana health|medanta|kokilaben|aster cmi|columbia asia|sakra world/i.test(providers);
}

module.exports = { evaluatePolicy, decideClaim, TREATMENT_TO_CATEGORY };
