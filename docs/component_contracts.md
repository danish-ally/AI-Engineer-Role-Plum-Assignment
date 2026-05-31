# Component Contracts

## Claim Input

```json
{
  "claimId": "TC03",
  "memberId": "EMP002",
  "treatmentType": "DIAGNOSTIC",
  "claimedAmount": 1800,
  "treatmentDate": "2024-11-06",
  "submissionDate": "2024-11-10",
  "preAuthorized": false,
  "documents": [
    {
      "id": "doc-1",
      "type": "PRESCRIPTION",
      "fileName": "rx.txt",
      "quality": "GOOD",
      "text": "OCR or extracted document text"
    }
  ]
}
```

## Intake Agent

Accepts: raw claim payload.

Produces: normalized claim with uppercase treatment/document types, numeric amount, default submission date, and document IDs.

Errors: does not throw for missing optional fields; invalid values are preserved for downstream checks and trace.

## Document Verification Agent

Accepts: normalized claim and policy configuration.

Produces:

```json
{
  "ok": true,
  "errors": [],
  "required": ["PRESCRIPTION", "LAB_REPORT", "HOSPITAL_BILL"],
  "optional": ["DISCHARGE_SUMMARY"],
  "present": ["PRESCRIPTION", "LAB_REPORT", "HOSPITAL_BILL"]
}
```

Errors: unsupported treatment type, missing required documents, unexpected document types. These stop processing before extraction.

## Extraction Agent

Accepts: normalized claim with documents.

Produces: structured extraction object containing patient, diagnosis, procedures, medicines, tests, providers, dates, document amounts, quality issues, raw document signals, and total document amount.

Errors: per-document parsing failures become quality issues and `DEGRADED` trace events. The component continues processing other documents.

## AI Extraction Adapter

Accepts: one normalized document, OCR/text content, and extraction helper functions.

Produces:

```json
{
  "ok": true,
  "mode": "schema_guided_ai_adapter",
  "fallbackUsed": false,
  "errors": [],
  "extraction": {
    "schemaVersion": "medical-claim-extraction.v1",
    "documentId": "F008",
    "declaredType": "HOSPITAL_BILL",
    "inferredType": "HOSPITAL_BILL",
    "patient": { "name": "Rajesh Kumar" },
    "providers": [],
    "diagnosis": [],
    "procedures": [],
    "medicines": [],
    "tests": [],
    "amounts": [],
    "dates": [],
    "lineItems": [],
    "quality": { "score": 0.88, "issue": null },
    "confidence": 0.96
  }
}
```

Errors: schema mismatches, missing document identifiers, invalid confidence, and malformed array fields. These are returned as validation errors and shown in trace; policy evaluation only consumes validated structured fields.

## Policy Evaluation Agent

Accepts: normalized claim, extracted data, and policy configuration.

Produces: ordered policy checks:

```json
{
  "name": "initial_waiting_period",
  "status": "PASSED",
  "message": "Member has 220 days since join; policy requires 30.",
  "details": {
    "daysSinceJoin": 220
  }
}
```

Errors: failed checks are represented as data, not thrown exceptions.

## Decision Agent

Accepts: claim, extracted data, policy evaluation, and policy configuration.

Produces:

```json
{
  "decision": "PARTIAL",
  "approvedAmount": 1350,
  "reason": "Policy copay or sub-limit reduced payable amount.",
  "confidence": 0.9
}
```

Rules:

- Hard policy failures become `REJECTED`.
- Missing pre-authorization or high-value review signals become `MANUAL_REVIEW`.
- Limit/co-pay reductions become `PARTIAL`.
- Clean payable claims become `APPROVED`.

Errors: no business errors are thrown; confidence is reduced for degraded input.

## Trace Contract

Every component appends:

```json
{
  "at": "2026-05-31T14:00:00.000Z",
  "component": "PolicyEvaluationAgent",
  "status": "PASSED",
  "message": "Policy checks completed.",
  "details": {}
}
```

Valid statuses: `PASSED`, `FAILED`, `WARN`, `DEGRADED`.
