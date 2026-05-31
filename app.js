const docTypes = ["PRESCRIPTION", "HOSPITAL_BILL", "LAB_REPORT", "PHARMACY_BILL", "DENTAL_REPORT", "DISCHARGE_SUMMARY"];
const qualityTypes = ["GOOD", "LOW", "UNREADABLE"];

let cases = [];
let policy = null;
let apiAvailable = true;

const els = {
  casePicker: document.querySelector("#casePicker"),
  form: document.querySelector("#claimForm"),
  documents: document.querySelector("#documents"),
  addDocument: document.querySelector("#addDocument"),
  emptyState: document.querySelector("#emptyState"),
  resultView: document.querySelector("#resultView"),
  decisionCard: document.querySelector("#decisionCard"),
  decisionText: document.querySelector("#decisionText"),
  approvedAmount: document.querySelector("#approvedAmount"),
  confidence: document.querySelector("#confidence"),
  traceCount: document.querySelector("#traceCount"),
  checkCount: document.querySelector("#checkCount"),
  reason: document.querySelector("#reason"),
  checks: document.querySelector("#checks"),
  extracted: document.querySelector("#extracted"),
  trace: document.querySelector("#trace"),
  memberId: document.querySelector("#memberId")
};

init();

async function init() {
  try {
    const [policyResponse, casesResponse] = await Promise.all([
      fetch(apiPath("/api/policy")),
      fetch(apiPath("/api/cases"))
    ]);
    if (!policyResponse.ok || !casesResponse.ok) throw new Error("API unavailable");
    policy = await policyResponse.json();
    cases = await casesResponse.json();
  } catch (error) {
    apiAvailable = false;
    const [policyResponse, casesResponse] = await Promise.all([
      fetch("./data/policy_terms.json"),
      fetch("./data/test_cases.json")
    ]);
    policy = await policyResponse.json();
    const payload = await casesResponse.json();
    cases = Array.isArray(payload) ? payload : payload.test_cases;
  }

  els.memberId.innerHTML = policy.members
    .map((member) => `<option value="${member.member_id}">${member.member_id} - ${member.name}</option>`)
    .join("");

  els.casePicker.innerHTML = cases
    .map((item, index) => `<option value="${index}">${item.case_id || item.id}: ${item.case_name || item.name}</option>`)
    .join("");

  els.casePicker.addEventListener("change", () => loadCase(toUiClaim(cases[Number(els.casePicker.value)])));
  els.addDocument.addEventListener("click", () => addDocument({ type: "PRESCRIPTION", quality: "GOOD", text: "" }));
  els.form.addEventListener("submit", submitClaim);

  loadCase(toUiClaim(cases[0]));
}

function toUiClaim(testCase) {
  const claim = testCase.claim || testCase.input || testCase;
  return {
    claimId: claim.claimId || claim.claim_id || testCase.case_id || "",
    memberId: claim.memberId || claim.member_id || "",
    treatmentType: claim.treatmentType || claim.claim_category || "",
    claimedAmount: claim.claimedAmount || claim.claimed_amount || 0,
    treatmentDate: claim.treatmentDate || claim.treatment_date || "",
    submissionDate: claim.submissionDate || claim.submission_date || claim.treatmentDate || claim.treatment_date || "",
    preAuthorized: claim.preAuthorized || claim.pre_authorized || false,
    rawTestCase: testCase,
    documents: (claim.documents || []).map((doc) => ({
      type: doc.type || doc.actual_type,
      quality: doc.quality || "GOOD",
      text: doc.text || contentToText(doc.content) || `File: ${doc.file_name || doc.fileName || doc.file_id || ""}\nDeclared type: ${doc.actual_type || doc.type || ""}\nPatient: ${doc.patient_name_on_doc || ""}`
    }))
  };
}

function loadCase(claim) {
  setValue("claimId", claim.claimId);
  setValue("memberId", claim.memberId);
  setValue("treatmentType", claim.treatmentType);
  setValue("claimedAmount", claim.claimedAmount);
  setValue("treatmentDate", claim.treatmentDate);
  setValue("submissionDate", claim.submissionDate);
  document.querySelector("#preAuthorized").checked = Boolean(claim.preAuthorized);
  els.documents.innerHTML = "";
  claim.documents.forEach(addDocument);
}

function addDocument(doc = {}) {
  const card = document.createElement("div");
  card.className = "doc-card";
  card.innerHTML = `
    <div class="doc-toolbar">
      <label>Type
        <select data-field="type">${docTypes.map((type) => `<option ${type === doc.type ? "selected" : ""}>${type}</option>`).join("")}</select>
      </label>
      <label>Quality
        <select data-field="quality">${qualityTypes.map((type) => `<option ${type === (doc.quality || "GOOD") ? "selected" : ""}>${type}</option>`).join("")}</select>
      </label>
      <button type="button" class="remove">Remove</button>
    </div>
    <label>Document text / OCR output
      <textarea data-field="text">${escapeHtml(doc.text || "")}</textarea>
    </label>
  `;
  card.querySelector(".remove").addEventListener("click", () => card.remove());
  els.documents.appendChild(card);
}

async function submitClaim(event) {
  event.preventDefault();
  const claim = readForm();
  const selectedCase = cases[Number(els.casePicker.value)];
  if (selectedCase) {
    claim.rawTestCase = selectedCase;
  }
  let result;
  if (apiAvailable) {
    const response = await fetch(apiPath("/api/claims"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(claim)
    });
    result = await response.json();
  } else {
    result = window.PlumStatic.processClaim(claim, policy);
  }
  renderResult(result);
}

function readForm() {
  return {
    claimId: value("claimId"),
    memberId: value("memberId"),
    treatmentType: value("treatmentType"),
    claimedAmount: Number(value("claimedAmount")),
    treatmentDate: value("treatmentDate"),
    submissionDate: value("submissionDate"),
    preAuthorized: document.querySelector("#preAuthorized").checked,
    documents: [...els.documents.querySelectorAll(".doc-card")].map((card, index) => ({
      id: `ui-doc-${index + 1}`,
      type: card.querySelector('[data-field="type"]').value,
      quality: card.querySelector('[data-field="quality"]').value,
      text: card.querySelector('[data-field="text"]').value
    }))
  };
}

function renderResult(result) {
  els.emptyState.classList.add("hidden");
  els.resultView.classList.remove("hidden");
  const visibleDecision = result.decision || result.status || "ACTION_REQUIRED";
  els.decisionCard.className = `decision-card ${visibleDecision}`;
  els.decisionText.textContent = visibleDecision;
  els.approvedAmount.textContent = formatMoney(result.approvedAmount || 0);
  els.confidence.textContent = `${Math.round((result.confidence || 0) * 100)}%`;
  els.traceCount.textContent = result.trace.length;
  els.checkCount.textContent = result.checks.length;
  els.reason.textContent = result.reason;
  els.extracted.textContent = JSON.stringify(result.extracted || result.verification, null, 2);

  els.checks.innerHTML = result.checks.length
    ? result.checks.map((check) => row(check.status, check.name, check.message)).join("")
    : row("FAILED", "document_verification", result.reason);

  els.trace.innerHTML = result.trace
    .map((step) => row(step.status, step.component, step.message))
    .join("");
}

function row(status, title, message) {
  return `
    <div class="trace-row">
      <span class="badge ${status}">${status}</span>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

function value(id) {
  return document.querySelector(`#${id}`).value;
}

function setValue(id, nextValue) {
  document.querySelector(`#${id}`).value = nextValue || "";
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function apiPath(path) {
  return path;
}

function contentToText(content) {
  if (!content) return "";
  return Object.entries(content).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}: ${value.map((item) => typeof item === "object" ? Object.values(item).join(" ") : item).join(" ")}`;
    }
    if (value && typeof value === "object") return `${key}: ${Object.values(value).join(" ")}`;
    return `${key}: ${value}`;
  }).join("\n");
}
