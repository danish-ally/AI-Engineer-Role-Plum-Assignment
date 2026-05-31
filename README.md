# Plum Claims Copilot

An explainable health insurance claims processing system for the Plum AI Engineer assignment. It accepts a claim, verifies required documents before extraction, extracts structured signals from messy medical document text, applies `policy_terms.json`, and returns `APPROVED`, `PARTIAL`, `REJECTED`, or `MANUAL_REVIEW` with an audit trace.

## Quick Start

```bash
npm start
```

Open `http://localhost:3000`.

Run tests and eval:

```bash
npm test
npm run eval
```

The eval report is generated at `reports/eval_report.md` and `reports/eval_results.json`.

## What Is Implemented

- Claim submission UI with sample cases.
- Early document verification using `policy_terms.json`.
- Specific, actionable document error messages.
- AI-style structured extraction adapter with a prompt contract, schema validation, confidence scoring, and deterministic fallback behavior.
- Structured extraction from OCR/text-like document content.
- Policy evaluation for members, waiting periods, exclusions, deadlines, sub-limits, co-pay, pre-authorization, and category rules.
- Explainable trace across intake, document verification, extraction, policy evaluation, and decision.
- Graceful degradation for unreadable documents and system errors.
- Dependency-free Node server, so it runs without installation beyond Node.js.

## Eval Suite

The app uses the original `test_cases.json` supplied with the assignment. Run `npm run eval` to regenerate the full report with decision output and trace for all 12 cases.

## Project Structure

```text
data/
  policy_terms.json
  test_cases.json
docs/
  architecture.md
  ai_integration.md
  component_contracts.md
  assignment.md
  sample_documents_guide.md
public/
  index.html
  styles.css
  app.js
src/
  pipeline.js
  documentVerifier.js
  extractor.js
  policyEngine.js
  trace.js
scripts/
  evaluate.js
tests/
  pipeline.test.js
reports/
  eval_report.md
```

## Demo Flow

1. Load `TC01_DOCUMENT_STOP_EARLY` to show early rejection for missing `PHARMACY_BILL`.
2. Load `TC03_APPROVED_DIAGNOSTIC` to show a clean approval and full trace.
3. Load `TC08_MANUAL_REVIEW_PREAUTH` to show pre-authorization manual review.
4. Explain the design decision: a deterministic policy engine is kept separate from extraction so policy behavior remains testable and explainable.

## AI Integration

The extraction layer uses a schema-guided AI adapter boundary in `src/aiExtractionAdapter.js`. It defines the prompt contract, expected JSON schema, validation rules, confidence scoring, and fallback behavior. The assignment demo runs deterministically for reliability, but the adapter is intentionally shaped so a production OCR/LLM call can replace the local extractor without changing the policy engine.
