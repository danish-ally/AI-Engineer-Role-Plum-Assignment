const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

function readJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadPolicy() {
  return readJson("policy_terms.json");
}

function loadTestCases() {
  const payload = readJson("test_cases.json");
  return Array.isArray(payload) ? payload : payload.test_cases;
}

module.exports = { loadPolicy, loadTestCases };
