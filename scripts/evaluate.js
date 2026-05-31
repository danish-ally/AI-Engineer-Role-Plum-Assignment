const fs = require("fs");
const path = require("path");
const { loadTestCases, loadPolicy } = require("../src/dataAccess");
const { processClaim } = require("../src/pipeline");

const policy = loadPolicy();
const cases = loadTestCases();
const results = cases.map((testCase) => {
  const result = processClaim(testCase, policy);
  const expectedDecision = Object.prototype.hasOwnProperty.call(testCase.expected, "decision")
    ? testCase.expected.decision
    : testCase.expectedDecision;
  return {
    id: testCase.case_id || testCase.id,
    name: testCase.case_name || testCase.name,
    expectedDecision,
    actualDecision: result.decision,
    matched: result.decision === expectedDecision,
    approvedAmount: result.approvedAmount,
    expectedApprovedAmount: testCase.expected.approved_amount,
    amountMatched: testCase.expected.approved_amount == null || result.approvedAmount === testCase.expected.approved_amount,
    confidence: result.confidence,
    reason: result.reason,
    fullOutput: result,
    trace: result.trace
  };
});

const reportDir = path.join(__dirname, "..", "reports");
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, "eval_results.json"), JSON.stringify(results, null, 2));
fs.writeFileSync(path.join(reportDir, "eval_report.md"), renderMarkdown(results));

const passCount = results.filter((row) => row.matched && row.amountMatched).length;
console.log(`Eval complete: ${passCount}/${results.length} matched expected decisions and amounts.`);
if (passCount !== results.length) {
  process.exitCode = 1;
}

function renderMarkdown(rows) {
  const lines = [
    "# Eval Report",
    "",
    "This report is generated from the original `test_cases.json` supplied with the assignment.",
    "",
    `Matched expected decisions and specified approved amounts: **${rows.filter((row) => row.matched && row.amountMatched).length}/${rows.length}**`,
    "",
    "| Case | Expected | Actual | Match | Expected Approved | Approved | Confidence | Reason |",
    "|---|---:|---:|---:|---:|---:|---:|---|"
  ];

  for (const row of rows) {
    lines.push(`| ${row.id} | ${row.expectedDecision} | ${row.actualDecision} | ${row.matched && row.amountMatched ? "Yes" : "No"} | ${row.expectedApprovedAmount ?? ""} | ${row.approvedAmount} | ${row.confidence} | ${escapePipe(row.reason)} |`);
  }

  lines.push("", "## Full Traces", "");
  for (const row of rows) {
    lines.push(`### ${row.id}: ${row.name}`, "");
    lines.push(`Expected: ${row.expectedDecision}; Actual: ${row.actualDecision}; Matched: ${row.matched && row.amountMatched ? "Yes" : "No"}`, "");
    lines.push("", "```json", JSON.stringify(row.fullOutput, null, 2), "```", "");
    for (const step of row.trace) {
      lines.push(`- **${step.component}** [${step.status}]: ${step.message}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function escapePipe(value) {
  return String(value || "").replace(/\|/g, "\\|");
}
