# AI Integration

## Why AI Is Used Here

Medical claim documents are messy: handwritten prescriptions, scanned invoices, stamps over text, and inconsistent Indian clinic formats. The system treats extraction as the AI-shaped part of the pipeline and keeps policy decisions deterministic.

This separation is intentional:

- AI extracts document facts.
- The policy engine makes repeatable decisions from structured facts.
- Every AI output is validated before policy rules use it.

## Current Implementation

The code uses a schema-guided AI adapter in `src/aiExtractionAdapter.js`.

The adapter defines:

- extraction schema version: `medical-claim-extraction.v1`
- prompt contract for a document extraction agent
- structured JSON output shape
- validation rules
- confidence score
- quality signals
- fallback-safe output

The local assignment run uses deterministic extraction behind this adapter so tests are stable and do not require API keys. This is a deliberate engineering trade-off: the architecture shows where AI belongs without making the evaluation dependent on external OCR/LLM availability.

## Prompt Contract

The adapter prompt tells the model:

- act only as a medical claims extraction agent
- return JSON matching the schema
- use `null` for missing fields
- include confidence based on readability
- never make a claim decision

That last point matters. The LLM should not decide whether to approve or reject a claim. It should only extract facts.

## Output Schema

Each document extraction returns:

```json
{
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
  "quality": {
    "score": 0.88,
    "issue": null
  },
  "confidence": 0.96
}
```

## Validation And Failure Handling

Before extracted data reaches policy evaluation, the adapter validates:

- schema version
- required identifiers
- numeric confidence
- array fields

If extraction quality is low, the trace shows a `DEGRADED` event and the final confidence drops. If a component failure is simulated, the pipeline continues, includes the failure in trace, and recommends manual review instead of crashing.

## Trace Visibility

The trace includes `AIExtractionAdapter` steps. This makes the AI layer auditable:

- which document was processed
- schema version used
- extraction mode
- confidence
- validation errors
- whether fallback was used

## Production Upgrade Path

In production, I would replace the deterministic extractor inside the adapter with:

1. OCR for images and PDFs.
2. LLM extraction using the same schema.
3. JSON schema validation.
4. Retry with a smaller prompt when validation fails.
5. Human review routing when confidence stays low.

The policy engine would not need to change because it already consumes structured extraction output.
