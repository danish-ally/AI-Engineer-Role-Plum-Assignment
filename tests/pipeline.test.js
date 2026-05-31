const assert = require("assert");
const { loadPolicy, loadTestCases } = require("../src/dataAccess");
const { processClaim } = require("../src/pipeline");

const policy = loadPolicy();
const cases = loadTestCases();

for (const testCase of cases) {
  const result = processClaim(testCase, policy);
  const expectedDecision = Object.prototype.hasOwnProperty.call(testCase.expected, "decision")
    ? testCase.expected.decision
    : testCase.expectedDecision;
  assert.strictEqual(
    result.decision,
    expectedDecision,
    `${testCase.case_id || testCase.id} expected ${expectedDecision}, got ${result.decision}: ${result.reason}`
  );
  if (testCase.expected.approved_amount != null) {
    assert.strictEqual(result.approvedAmount, testCase.expected.approved_amount, `${testCase.case_id} expected approved amount ${testCase.expected.approved_amount}, got ${result.approvedAmount}`);
  }
  assert.ok(Array.isArray(result.trace) && result.trace.length >= 2, `${testCase.case_id || testCase.id} should include a full trace`);
  assert.ok(typeof result.confidence === "number", `${testCase.id} should include confidence`);
  assert.ok(result.reason, `${testCase.id} should include a reason`);
}

const earlyStop = processClaim(cases[0], policy);
assert.strictEqual(earlyStop.decision, null, "Document verification failures should stop before claim decision");
assert.strictEqual(earlyStop.extracted, null, "Document verification failures should stop before extraction");
assert.ok(/PRESCRIPTION/.test(earlyStop.reason) && /HOSPITAL_BILL/.test(earlyStop.reason), "Early stop message should name uploaded and required document types");

console.log(`All pipeline tests passed (${cases.length} test cases).`);
