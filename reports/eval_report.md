# Eval Report

This report is generated from the original `test_cases.json` supplied with the assignment.

Matched expected decisions and specified approved amounts: **12/12**

| Case | Expected | Actual | Match | Expected Approved | Approved | Confidence | Reason |
|---|---:|---:|---:|---:|---:|---:|---|
| TC001 | null | null | Yes |  | 0 | 0.96 | Uploaded document type: PRESCRIPTION (doctor prescription). Required document type missing: HOSPITAL_BILL. Please upload a hospital or clinic bill for CONSULTATION claims. |
| TC002 | null | null | Yes |  | 0 | 0.96 | The pharmacy bill (blurry_bill.jpg) cannot be read. Please re-upload a clearer PHARMACY_BILL document. |
| TC003 | null | null | Yes |  | 0 | 0.94 | Documents appear to belong to different patients: Rajesh Kumar, Arjun Mehta. Please upload documents for the same patient. |
| TC004 | APPROVED | APPROVED | Yes | 1350 | 1350 | 0.9 | All required policy checks passed. |
| TC005 | REJECTED | REJECTED | Yes |  | 0 | 0.94 | diabetes waiting period requires 90 days; member has 44. Eligible from 2024-11-30. |
| TC006 | PARTIAL | PARTIAL | Yes | 8000 | 8000 | 0.82 | Approved covered dental items and rejected excluded items: Teeth Whitening (Cosmetic dental procedure is excluded). |
| TC007 | REJECTED | REJECTED | Yes |  | 0 | 0.94 | Claimed amount 15000 exceeds per-claim limit 5000. Claimed amount 15000 checked against diagnostic sub-limit 10000. High-value diagnostic test requires pre-authorization but none was supplied. Please resubmit with a valid pre-authorization approval. |
| TC008 | REJECTED | REJECTED | Yes |  | 0 | 0.94 | Claimed amount 7500 exceeds per-claim limit 5000. |
| TC009 | MANUAL_REVIEW | MANUAL_REVIEW | Yes |  | 0 | 0.35 | One or more documents had low readability; confidence reduced. Member already has 3 claims on 2024-10-30; this exceeds same-day claim threshold 2. |
| TC010 | APPROVED | APPROVED | Yes | 3240 | 3240 | 0.9 | All required policy checks passed. |
| TC011 | APPROVED | APPROVED | Yes |  | 4000 | 0.78 | All required policy checks passed. Manual review is recommended because one processing component was skipped. |
| TC012 | REJECTED | REJECTED | Yes |  | 0 | 0.94 | Claimed amount 8000 exceeds per-claim limit 5000. Claim appears related to excluded item: Obesity and weight loss programs. |

## Full Traces

### TC001: Wrong Document Uploaded

Expected: null; Actual: null; Matched: Yes


```json
{
  "claimId": "TC001",
  "decision": null,
  "status": "ACTION_REQUIRED",
  "approvedAmount": 0,
  "reason": "Uploaded document type: PRESCRIPTION (doctor prescription). Required document type missing: HOSPITAL_BILL. Please upload a hospital or clinic bill for CONSULTATION claims.",
  "confidence": 0.96,
  "verification": {
    "ok": false,
    "errors": [
      "Uploaded document type: PRESCRIPTION (doctor prescription). Required document type missing: HOSPITAL_BILL. Please upload a hospital or clinic bill for CONSULTATION claims."
    ],
    "required": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ],
    "optional": [
      "LAB_REPORT",
      "DIAGNOSTIC_REPORT"
    ],
    "present": [
      "PRESCRIPTION"
    ]
  },
  "extracted": null,
  "checks": [],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.893Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC001",
        "memberId": "EMP001",
        "treatmentType": "CONSULTATION",
        "claimedAmount": 1500,
        "documentCount": 2
      }
    },
    {
      "at": "2026-05-31T16:57:32.893Z",
      "component": "DocumentVerificationAgent",
      "status": "FAILED",
      "message": "Claim stopped before extraction because required documents did not match policy requirements.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ],
        "optional": [
          "LAB_REPORT",
          "DIAGNOSTIC_REPORT"
        ],
        "present": [
          "PRESCRIPTION"
        ],
        "missing": [
          "HOSPITAL_BILL"
        ],
        "unexpected": [],
        "unreadableRequired": [],
        "messages": [
          "Uploaded document type: PRESCRIPTION (doctor prescription). Required document type missing: HOSPITAL_BILL. Please upload a hospital or clinic bill for CONSULTATION claims."
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.893Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Claim stopped before decision because member action is required.",
      "details": {
        "decision": null,
        "reason": "Uploaded document type: PRESCRIPTION (doctor prescription). Required document type missing: HOSPITAL_BILL. Please upload a hospital or clinic bill for CONSULTATION claims."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [FAILED]: Claim stopped before extraction because required documents did not match policy requirements.
- **DecisionAgent** [PASSED]: Claim stopped before decision because member action is required.

### TC002: Unreadable Document

Expected: null; Actual: null; Matched: Yes


```json
{
  "claimId": "TC002",
  "decision": null,
  "status": "ACTION_REQUIRED",
  "approvedAmount": 0,
  "reason": "The pharmacy bill (blurry_bill.jpg) cannot be read. Please re-upload a clearer PHARMACY_BILL document.",
  "confidence": 0.96,
  "verification": {
    "ok": false,
    "errors": [
      "The pharmacy bill (blurry_bill.jpg) cannot be read. Please re-upload a clearer PHARMACY_BILL document."
    ],
    "required": [
      "PRESCRIPTION",
      "PHARMACY_BILL"
    ],
    "optional": [],
    "present": [
      "PRESCRIPTION",
      "PHARMACY_BILL"
    ]
  },
  "extracted": null,
  "checks": [],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.893Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC002",
        "memberId": "EMP004",
        "treatmentType": "PHARMACY",
        "claimedAmount": 800,
        "documentCount": 2
      }
    },
    {
      "at": "2026-05-31T16:57:32.893Z",
      "component": "DocumentVerificationAgent",
      "status": "FAILED",
      "message": "Claim stopped before extraction because required documents did not match policy requirements.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "PHARMACY_BILL"
        ],
        "optional": [],
        "present": [
          "PRESCRIPTION",
          "PHARMACY_BILL"
        ],
        "missing": [],
        "unexpected": [],
        "unreadableRequired": [
          {
            "documentId": "F004",
            "type": "PHARMACY_BILL",
            "fileName": "blurry_bill.jpg"
          }
        ],
        "messages": [
          "The pharmacy bill (blurry_bill.jpg) cannot be read. Please re-upload a clearer PHARMACY_BILL document."
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.893Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Claim stopped before decision because member action is required.",
      "details": {
        "decision": null,
        "reason": "The pharmacy bill (blurry_bill.jpg) cannot be read. Please re-upload a clearer PHARMACY_BILL document."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [FAILED]: Claim stopped before extraction because required documents did not match policy requirements.
- **DecisionAgent** [PASSED]: Claim stopped before decision because member action is required.

### TC003: Documents Belong to Different Patients

Expected: null; Actual: null; Matched: Yes


```json
{
  "claimId": "TC003",
  "decision": null,
  "status": "ACTION_REQUIRED",
  "approvedAmount": 0,
  "reason": "Documents appear to belong to different patients: Rajesh Kumar, Arjun Mehta. Please upload documents for the same patient.",
  "confidence": 0.94,
  "verification": {
    "ok": true,
    "errors": [],
    "required": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ],
    "optional": [
      "LAB_REPORT",
      "DIAGNOSTIC_REPORT"
    ],
    "present": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ]
  },
  "extracted": {
    "patient": {},
    "diagnosis": [],
    "procedures": [],
    "medicines": [],
    "tests": [],
    "providers": [],
    "documentAmounts": [],
    "dates": [],
    "qualityIssues": [
      {
        "documentId": "F005",
        "documentType": "PRESCRIPTION",
        "issue": "Low readability or insufficient text",
        "qualityScore": 0.45
      },
      {
        "documentId": "F006",
        "documentType": "HOSPITAL_BILL",
        "issue": "Low readability or insufficient text",
        "qualityScore": 0.45
      }
    ],
    "rawSignals": [
      {
        "documentId": "F005",
        "declaredType": "PRESCRIPTION",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.45,
        "hasText": false,
        "textLength": 0
      },
      {
        "documentId": "F006",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "HOSPITAL_BILL",
        "qualityScore": 0.45,
        "hasText": false,
        "textLength": 0
      }
    ],
    "totalDocumentAmount": 0
  },
  "checks": [],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.893Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC003",
        "memberId": "EMP001",
        "treatmentType": "CONSULTATION",
        "claimedAmount": 1500,
        "documentCount": 2
      }
    },
    {
      "at": "2026-05-31T16:57:32.893Z",
      "component": "DocumentVerificationAgent",
      "status": "PASSED",
      "message": "All required document types are present.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ],
        "optional": [
          "LAB_REPORT",
          "DIAGNOSTIC_REPORT"
        ],
        "present": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.894Z",
      "component": "ExtractionAgent",
      "status": "DEGRADED",
      "message": "Extracted structured fields from PRESCRIPTION.",
      "details": {
        "documentId": "F005",
        "declaredType": "PRESCRIPTION",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.45,
        "fieldsFound": {
          "patientName": false,
          "doctorName": false,
          "providerName": false,
          "diagnosis": false,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.895Z",
      "component": "ExtractionAgent",
      "status": "DEGRADED",
      "message": "Extracted structured fields from HOSPITAL_BILL.",
      "details": {
        "documentId": "F006",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "HOSPITAL_BILL",
        "qualityScore": 0.45,
        "fieldsFound": {
          "patientName": false,
          "doctorName": false,
          "providerName": false,
          "diagnosis": false,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.895Z",
      "component": "ConsistencyAgent",
      "status": "FAILED",
      "message": "Documents belong to different patients.",
      "details": {
        "patientNamesByDocument": [
          {
            "documentId": "F005",
            "documentType": "PRESCRIPTION",
            "patientName": "Rajesh Kumar"
          },
          {
            "documentId": "F006",
            "documentType": "HOSPITAL_BILL",
            "patientName": "Arjun Mehta"
          }
        ],
        "errors": [
          "Documents appear to belong to different patients: Rajesh Kumar, Arjun Mehta. Please upload documents for the same patient."
        ]
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [PASSED]: All required document types are present.
- **ExtractionAgent** [DEGRADED]: Extracted structured fields from PRESCRIPTION.
- **ExtractionAgent** [DEGRADED]: Extracted structured fields from HOSPITAL_BILL.
- **ConsistencyAgent** [FAILED]: Documents belong to different patients.

### TC004: Clean Consultation — Full Approval

Expected: APPROVED; Actual: APPROVED; Matched: Yes


```json
{
  "claimId": "TC004",
  "decision": "APPROVED",
  "approvedAmount": 1350,
  "reason": "All required policy checks passed.",
  "confidence": 0.9,
  "verification": {
    "ok": true,
    "errors": [],
    "required": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ],
    "optional": [
      "LAB_REPORT",
      "DIAGNOSTIC_REPORT"
    ],
    "present": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ]
  },
  "extracted": {
    "patient": {
      "name": "City Clinic"
    },
    "diagnosis": [
      "Viral Fever",
      "Viral Fever"
    ],
    "procedures": [],
    "medicines": [
      "Paracetamol 650mg",
      "Vitamin C 500mg"
    ],
    "tests": [
      "CBC",
      "Dengue NS1"
    ],
    "providers": [
      {
        "role": "doctor",
        "name": "Dr. Arun Sharma"
      },
      {
        "role": "doctor",
        "name": "Dr. Arun Sharma"
      },
      {
        "role": "facility",
        "name": "City Clinic, Bengaluru"
      },
      {
        "role": "facility",
        "name": "hospital_name: City Clinic, Bengaluru"
      }
    ],
    "documentAmounts": [
      {
        "documentId": "F008",
        "documentType": "HOSPITAL_BILL",
        "amount": 1500
      }
    ],
    "dates": [
      "2024-11-01",
      "2024-11-01",
      "2024-11-01",
      "2024-11-01"
    ],
    "qualityIssues": [],
    "rawSignals": [
      {
        "documentId": "F007",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 175
      },
      {
        "documentId": "F008",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "HOSPITAL_BILL",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 160
      }
    ],
    "lineItems": [
      {
        "documentId": "F008",
        "documentType": "HOSPITAL_BILL",
        "description": "Consultation Fee",
        "amount": 1000
      },
      {
        "documentId": "F008",
        "documentType": "HOSPITAL_BILL",
        "description": "CBC Test",
        "amount": 300
      },
      {
        "documentId": "F008",
        "documentType": "HOSPITAL_BILL",
        "description": "Dengue NS1 Test",
        "amount": 200
      }
    ],
    "totalDocumentAmount": 1500
  },
  "checks": [
    {
      "name": "member_eligibility",
      "status": "PASSED",
      "message": "Member exists in policy roster.",
      "details": {
        "memberId": "EMP001"
      }
    },
    {
      "name": "initial_waiting_period",
      "status": "PASSED",
      "message": "Member has 214 days since join; policy requires 30.",
      "details": {
        "daysSinceJoin": 214
      }
    },
    {
      "name": "category_covered",
      "status": "PASSED",
      "message": "CONSULTATION is covered.",
      "details": {
        "categoryKey": "consultation"
      }
    },
    {
      "name": "minimum_claim_amount",
      "status": "PASSED",
      "message": "Claimed amount is 1500; minimum is 500.",
      "details": {}
    },
    {
      "name": "per_claim_limit",
      "status": "PASSED",
      "message": "Claimed amount 1500 exceeds per-claim limit 5000.",
      "details": {}
    },
    {
      "name": "submission_deadline",
      "status": "PASSED",
      "message": "Submitted 0 days after treatment; allowed 30.",
      "details": {
        "daysToSubmit": 0
      }
    },
    {
      "name": "exclusion_screen",
      "status": "PASSED",
      "message": "No configured exclusion matched extracted text.",
      "details": {}
    }
  ],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.895Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC004",
        "memberId": "EMP001",
        "treatmentType": "CONSULTATION",
        "claimedAmount": 1500,
        "documentCount": 2
      }
    },
    {
      "at": "2026-05-31T16:57:32.895Z",
      "component": "DocumentVerificationAgent",
      "status": "PASSED",
      "message": "All required document types are present.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ],
        "optional": [
          "LAB_REPORT",
          "DIAGNOSTIC_REPORT"
        ],
        "present": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.895Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from PRESCRIPTION.",
      "details": {
        "documentId": "F007",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": true,
          "providerName": false,
          "diagnosis": true,
          "procedure": false,
          "dates": 1,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.895Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from HOSPITAL_BILL.",
      "details": {
        "documentId": "F008",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "HOSPITAL_BILL",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": true,
          "diagnosis": false,
          "procedure": false,
          "dates": 1,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.895Z",
      "component": "ConsistencyAgent",
      "status": "PASSED",
      "message": "Document patient identity checks passed.",
      "details": {
        "patientNames": [
          "Rajesh Kumar"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.896Z",
      "component": "PolicyEvaluationAgent",
      "status": "PASSED",
      "message": "Policy checks completed.",
      "details": {
        "passed": 7,
        "failed": 0,
        "warnings": 0,
        "checks": [
          {
            "name": "member_eligibility",
            "status": "PASSED",
            "message": "Member exists in policy roster.",
            "details": {
              "memberId": "EMP001"
            }
          },
          {
            "name": "initial_waiting_period",
            "status": "PASSED",
            "message": "Member has 214 days since join; policy requires 30.",
            "details": {
              "daysSinceJoin": 214
            }
          },
          {
            "name": "category_covered",
            "status": "PASSED",
            "message": "CONSULTATION is covered.",
            "details": {
              "categoryKey": "consultation"
            }
          },
          {
            "name": "minimum_claim_amount",
            "status": "PASSED",
            "message": "Claimed amount is 1500; minimum is 500.",
            "details": {}
          },
          {
            "name": "per_claim_limit",
            "status": "PASSED",
            "message": "Claimed amount 1500 exceeds per-claim limit 5000.",
            "details": {}
          },
          {
            "name": "submission_deadline",
            "status": "PASSED",
            "message": "Submitted 0 days after treatment; allowed 30.",
            "details": {
              "daysToSubmit": 0
            }
          },
          {
            "name": "exclusion_screen",
            "status": "PASSED",
            "message": "No configured exclusion matched extracted text.",
            "details": {}
          }
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.896Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Final decision: APPROVED.",
      "details": {
        "decision": "APPROVED",
        "approvedAmount": 1350,
        "confidence": 0.9,
        "reason": "All required policy checks passed."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [PASSED]: All required document types are present.
- **ExtractionAgent** [PASSED]: Extracted structured fields from PRESCRIPTION.
- **ExtractionAgent** [PASSED]: Extracted structured fields from HOSPITAL_BILL.
- **ConsistencyAgent** [PASSED]: Document patient identity checks passed.
- **PolicyEvaluationAgent** [PASSED]: Policy checks completed.
- **DecisionAgent** [PASSED]: Final decision: APPROVED.

### TC005: Waiting Period — Diabetes

Expected: REJECTED; Actual: REJECTED; Matched: Yes


```json
{
  "claimId": "TC005",
  "decision": "REJECTED",
  "approvedAmount": 0,
  "reason": "diabetes waiting period requires 90 days; member has 44. Eligible from 2024-11-30.",
  "confidence": 0.94,
  "verification": {
    "ok": true,
    "errors": [],
    "required": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ],
    "optional": [
      "LAB_REPORT",
      "DIAGNOSTIC_REPORT"
    ],
    "present": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ]
  },
  "extracted": {
    "patient": {
      "name": "Vikram Joshi"
    },
    "diagnosis": [
      "Type 2 Diabetes Mellitus",
      "Type 2 Diabetes Mellitus"
    ],
    "procedures": [],
    "medicines": [
      "Metformin 500mg",
      "Glimepiride 1mg"
    ],
    "tests": [],
    "providers": [
      {
        "role": "doctor",
        "name": "Dr. Sunil Mehta"
      },
      {
        "role": "doctor",
        "name": "Dr. Sunil Mehta"
      }
    ],
    "documentAmounts": [
      {
        "documentId": "F010",
        "documentType": "HOSPITAL_BILL",
        "amount": 3000
      }
    ],
    "dates": [
      "2024-10-15",
      "2024-10-15"
    ],
    "qualityIssues": [],
    "rawSignals": [
      {
        "documentId": "F009",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 169
      },
      {
        "documentId": "F010",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 55
      }
    ],
    "totalDocumentAmount": 3000
  },
  "checks": [
    {
      "name": "member_eligibility",
      "status": "PASSED",
      "message": "Member exists in policy roster.",
      "details": {
        "memberId": "EMP005"
      }
    },
    {
      "name": "initial_waiting_period",
      "status": "PASSED",
      "message": "Member has 44 days since join; policy requires 30.",
      "details": {
        "daysSinceJoin": 44
      }
    },
    {
      "name": "category_covered",
      "status": "PASSED",
      "message": "CONSULTATION is covered.",
      "details": {
        "categoryKey": "consultation"
      }
    },
    {
      "name": "minimum_claim_amount",
      "status": "PASSED",
      "message": "Claimed amount is 3000; minimum is 500.",
      "details": {}
    },
    {
      "name": "per_claim_limit",
      "status": "PASSED",
      "message": "Claimed amount 3000 exceeds per-claim limit 5000.",
      "details": {}
    },
    {
      "name": "submission_deadline",
      "status": "PASSED",
      "message": "Submitted 0 days after treatment; allowed 30.",
      "details": {
        "daysToSubmit": 0
      }
    },
    {
      "name": "exclusion_screen",
      "status": "PASSED",
      "message": "No configured exclusion matched extracted text.",
      "details": {}
    },
    {
      "name": "waiting_period_diabetes",
      "status": "FAILED",
      "message": "diabetes waiting period requires 90 days; member has 44. Eligible from 2024-11-30.",
      "details": {
        "condition": "diabetes",
        "requiredDays": 90,
        "treatmentDays": 44,
        "eligibleFrom": "2024-11-30"
      }
    }
  ],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.896Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC005",
        "memberId": "EMP005",
        "treatmentType": "CONSULTATION",
        "claimedAmount": 3000,
        "documentCount": 2
      }
    },
    {
      "at": "2026-05-31T16:57:32.896Z",
      "component": "DocumentVerificationAgent",
      "status": "PASSED",
      "message": "All required document types are present.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ],
        "optional": [
          "LAB_REPORT",
          "DIAGNOSTIC_REPORT"
        ],
        "present": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.896Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from PRESCRIPTION.",
      "details": {
        "documentId": "F009",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": true,
          "providerName": false,
          "diagnosis": true,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from HOSPITAL_BILL.",
      "details": {
        "documentId": "F010",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": false,
          "diagnosis": false,
          "procedure": false,
          "dates": 1,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ConsistencyAgent",
      "status": "PASSED",
      "message": "Document patient identity checks passed.",
      "details": {
        "patientNames": [
          "Vikram Joshi"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "PolicyEvaluationAgent",
      "status": "FAILED",
      "message": "Policy checks completed.",
      "details": {
        "passed": 7,
        "failed": 1,
        "warnings": 0,
        "checks": [
          {
            "name": "member_eligibility",
            "status": "PASSED",
            "message": "Member exists in policy roster.",
            "details": {
              "memberId": "EMP005"
            }
          },
          {
            "name": "initial_waiting_period",
            "status": "PASSED",
            "message": "Member has 44 days since join; policy requires 30.",
            "details": {
              "daysSinceJoin": 44
            }
          },
          {
            "name": "category_covered",
            "status": "PASSED",
            "message": "CONSULTATION is covered.",
            "details": {
              "categoryKey": "consultation"
            }
          },
          {
            "name": "minimum_claim_amount",
            "status": "PASSED",
            "message": "Claimed amount is 3000; minimum is 500.",
            "details": {}
          },
          {
            "name": "per_claim_limit",
            "status": "PASSED",
            "message": "Claimed amount 3000 exceeds per-claim limit 5000.",
            "details": {}
          },
          {
            "name": "submission_deadline",
            "status": "PASSED",
            "message": "Submitted 0 days after treatment; allowed 30.",
            "details": {
              "daysToSubmit": 0
            }
          },
          {
            "name": "exclusion_screen",
            "status": "PASSED",
            "message": "No configured exclusion matched extracted text.",
            "details": {}
          },
          {
            "name": "waiting_period_diabetes",
            "status": "FAILED",
            "message": "diabetes waiting period requires 90 days; member has 44. Eligible from 2024-11-30.",
            "details": {
              "condition": "diabetes",
              "requiredDays": 90,
              "treatmentDays": 44,
              "eligibleFrom": "2024-11-30"
            }
          }
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Final decision: REJECTED.",
      "details": {
        "decision": "REJECTED",
        "approvedAmount": 0,
        "confidence": 0.94,
        "reason": "diabetes waiting period requires 90 days; member has 44. Eligible from 2024-11-30."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [PASSED]: All required document types are present.
- **ExtractionAgent** [PASSED]: Extracted structured fields from PRESCRIPTION.
- **ExtractionAgent** [PASSED]: Extracted structured fields from HOSPITAL_BILL.
- **ConsistencyAgent** [PASSED]: Document patient identity checks passed.
- **PolicyEvaluationAgent** [FAILED]: Policy checks completed.
- **DecisionAgent** [PASSED]: Final decision: REJECTED.

### TC006: Dental Partial Approval — Cosmetic Exclusion

Expected: PARTIAL; Actual: PARTIAL; Matched: Yes


```json
{
  "claimId": "TC006",
  "decision": "PARTIAL",
  "approvedAmount": 8000,
  "reason": "Approved covered dental items and rejected excluded items: Teeth Whitening (Cosmetic dental procedure is excluded).",
  "confidence": 0.82,
  "verification": {
    "ok": true,
    "errors": [],
    "required": [
      "HOSPITAL_BILL"
    ],
    "optional": [
      "PRESCRIPTION",
      "DENTAL_REPORT"
    ],
    "present": [
      "HOSPITAL_BILL"
    ]
  },
  "extracted": {
    "patient": {
      "name": "Smile Dental Clinic"
    },
    "diagnosis": [],
    "procedures": [],
    "medicines": [],
    "tests": [],
    "providers": [
      {
        "role": "facility",
        "name": "Smile Dental Clinic"
      },
      {
        "role": "facility",
        "name": "patient"
      }
    ],
    "documentAmounts": [
      {
        "documentId": "F011",
        "documentType": "HOSPITAL_BILL",
        "amount": 12000
      }
    ],
    "dates": [],
    "qualityIssues": [],
    "rawSignals": [
      {
        "documentId": "F011",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "HOSPITAL_BILL",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 132
      }
    ],
    "lineItems": [
      {
        "documentId": "F011",
        "documentType": "HOSPITAL_BILL",
        "description": "Root Canal Treatment",
        "amount": 8000
      },
      {
        "documentId": "F011",
        "documentType": "HOSPITAL_BILL",
        "description": "Teeth Whitening",
        "amount": 4000
      }
    ],
    "totalDocumentAmount": 12000
  },
  "checks": [
    {
      "name": "member_eligibility",
      "status": "PASSED",
      "message": "Member exists in policy roster.",
      "details": {
        "memberId": "EMP002"
      }
    },
    {
      "name": "initial_waiting_period",
      "status": "PASSED",
      "message": "Member has 197 days since join; policy requires 30.",
      "details": {
        "daysSinceJoin": 197
      }
    },
    {
      "name": "category_covered",
      "status": "PASSED",
      "message": "DENTAL is covered.",
      "details": {
        "categoryKey": "dental"
      }
    },
    {
      "name": "minimum_claim_amount",
      "status": "PASSED",
      "message": "Claimed amount is 12000; minimum is 500.",
      "details": {}
    },
    {
      "name": "submission_deadline",
      "status": "PASSED",
      "message": "Submitted 0 days after treatment; allowed 30.",
      "details": {
        "daysToSubmit": 0
      }
    },
    {
      "name": "category_sub_limit",
      "status": "FAILED",
      "message": "Claimed amount 12000 checked against dental sub-limit 10000.",
      "details": {
        "subLimit": 10000
      }
    },
    {
      "name": "exclusion_screen",
      "status": "FAILED",
      "message": "Claim appears related to excluded item: Teeth whitening.",
      "details": {
        "matched": "Teeth whitening"
      }
    },
    {
      "name": "dental_procedure",
      "status": "PASSED",
      "message": "At least one dental line item is covered.",
      "details": {
        "covered": true,
        "excluded": true
      }
    }
  ],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC006",
        "memberId": "EMP002",
        "treatmentType": "DENTAL",
        "claimedAmount": 12000,
        "documentCount": 1
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "DocumentVerificationAgent",
      "status": "PASSED",
      "message": "All required document types are present.",
      "details": {
        "required": [
          "HOSPITAL_BILL"
        ],
        "optional": [
          "PRESCRIPTION",
          "DENTAL_REPORT"
        ],
        "present": [
          "HOSPITAL_BILL"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from HOSPITAL_BILL.",
      "details": {
        "documentId": "F011",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "HOSPITAL_BILL",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": true,
          "diagnosis": false,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ConsistencyAgent",
      "status": "PASSED",
      "message": "Document patient identity checks passed.",
      "details": {
        "patientNames": [
          "Priya Singh"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "PolicyEvaluationAgent",
      "status": "FAILED",
      "message": "Policy checks completed.",
      "details": {
        "passed": 6,
        "failed": 2,
        "warnings": 0,
        "checks": [
          {
            "name": "member_eligibility",
            "status": "PASSED",
            "message": "Member exists in policy roster.",
            "details": {
              "memberId": "EMP002"
            }
          },
          {
            "name": "initial_waiting_period",
            "status": "PASSED",
            "message": "Member has 197 days since join; policy requires 30.",
            "details": {
              "daysSinceJoin": 197
            }
          },
          {
            "name": "category_covered",
            "status": "PASSED",
            "message": "DENTAL is covered.",
            "details": {
              "categoryKey": "dental"
            }
          },
          {
            "name": "minimum_claim_amount",
            "status": "PASSED",
            "message": "Claimed amount is 12000; minimum is 500.",
            "details": {}
          },
          {
            "name": "submission_deadline",
            "status": "PASSED",
            "message": "Submitted 0 days after treatment; allowed 30.",
            "details": {
              "daysToSubmit": 0
            }
          },
          {
            "name": "category_sub_limit",
            "status": "FAILED",
            "message": "Claimed amount 12000 checked against dental sub-limit 10000.",
            "details": {
              "subLimit": 10000
            }
          },
          {
            "name": "exclusion_screen",
            "status": "FAILED",
            "message": "Claim appears related to excluded item: Teeth whitening.",
            "details": {
              "matched": "Teeth whitening"
            }
          },
          {
            "name": "dental_procedure",
            "status": "PASSED",
            "message": "At least one dental line item is covered.",
            "details": {
              "covered": true,
              "excluded": true
            }
          }
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Final decision: PARTIAL.",
      "details": {
        "decision": "PARTIAL",
        "approvedAmount": 8000,
        "confidence": 0.82,
        "reason": "Approved covered dental items and rejected excluded items: Teeth Whitening (Cosmetic dental procedure is excluded)."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [PASSED]: All required document types are present.
- **ExtractionAgent** [PASSED]: Extracted structured fields from HOSPITAL_BILL.
- **ConsistencyAgent** [PASSED]: Document patient identity checks passed.
- **PolicyEvaluationAgent** [FAILED]: Policy checks completed.
- **DecisionAgent** [PASSED]: Final decision: PARTIAL.

### TC007: MRI Without Pre-Authorization

Expected: REJECTED; Actual: REJECTED; Matched: Yes


```json
{
  "claimId": "TC007",
  "decision": "REJECTED",
  "approvedAmount": 0,
  "reason": "Claimed amount 15000 exceeds per-claim limit 5000. Claimed amount 15000 checked against diagnostic sub-limit 10000. High-value diagnostic test requires pre-authorization but none was supplied. Please resubmit with a valid pre-authorization approval.",
  "confidence": 0.94,
  "verification": {
    "ok": true,
    "errors": [],
    "required": [
      "PRESCRIPTION",
      "LAB_REPORT",
      "HOSPITAL_BILL"
    ],
    "optional": [
      "DISCHARGE_SUMMARY"
    ],
    "present": [
      "PRESCRIPTION",
      "LAB_REPORT",
      "HOSPITAL_BILL"
    ]
  },
  "extracted": {
    "patient": {
      "name": "MRI Lumbar Spine"
    },
    "diagnosis": [
      "Suspected Lumbar Disc Herniation",
      "Suspected Lumbar Disc Herniation"
    ],
    "procedures": [],
    "medicines": [],
    "tests": [
      "MRI Lumbar Spine",
      "MRI",
      "MRI Lumbar Spine",
      "MRI",
      "MRI"
    ],
    "providers": [
      {
        "role": "doctor",
        "name": "Dr. Venkat Rao"
      },
      {
        "role": "doctor",
        "name": "Dr. Venkat Rao"
      }
    ],
    "documentAmounts": [
      {
        "documentId": "F014",
        "documentType": "HOSPITAL_BILL",
        "amount": 15000
      }
    ],
    "dates": [],
    "qualityIssues": [],
    "rawSignals": [
      {
        "documentId": "F012",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 138
      },
      {
        "documentId": "F013",
        "declaredType": "LAB_REPORT",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 27
      },
      {
        "documentId": "F014",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 47
      }
    ],
    "lineItems": [
      {
        "documentId": "F014",
        "documentType": "HOSPITAL_BILL",
        "description": "MRI Lumbar Spine",
        "amount": 15000
      }
    ],
    "totalDocumentAmount": 15000
  },
  "checks": [
    {
      "name": "member_eligibility",
      "status": "PASSED",
      "message": "Member exists in policy roster.",
      "details": {
        "memberId": "EMP007"
      }
    },
    {
      "name": "initial_waiting_period",
      "status": "PASSED",
      "message": "Member has 215 days since join; policy requires 30.",
      "details": {
        "daysSinceJoin": 215
      }
    },
    {
      "name": "category_covered",
      "status": "PASSED",
      "message": "DIAGNOSTIC is covered.",
      "details": {
        "categoryKey": "diagnostic"
      }
    },
    {
      "name": "minimum_claim_amount",
      "status": "PASSED",
      "message": "Claimed amount is 15000; minimum is 500.",
      "details": {}
    },
    {
      "name": "per_claim_limit",
      "status": "FAILED",
      "message": "Claimed amount 15000 exceeds per-claim limit 5000.",
      "details": {}
    },
    {
      "name": "submission_deadline",
      "status": "PASSED",
      "message": "Submitted 0 days after treatment; allowed 30.",
      "details": {
        "daysToSubmit": 0
      }
    },
    {
      "name": "category_sub_limit",
      "status": "FAILED",
      "message": "Claimed amount 15000 checked against diagnostic sub-limit 10000.",
      "details": {
        "subLimit": 10000
      }
    },
    {
      "name": "exclusion_screen",
      "status": "PASSED",
      "message": "No configured exclusion matched extracted text.",
      "details": {}
    },
    {
      "name": "pre_authorization",
      "status": "FAILED",
      "message": "High-value diagnostic test requires pre-authorization but none was supplied. Please resubmit with a valid pre-authorization approval.",
      "details": {
        "tests": [
          "MRI Lumbar Spine",
          "MRI",
          "MRI Lumbar Spine",
          "MRI",
          "MRI"
        ],
        "threshold": 10000
      }
    }
  ],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC007",
        "memberId": "EMP007",
        "treatmentType": "DIAGNOSTIC",
        "claimedAmount": 15000,
        "documentCount": 3
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "DocumentVerificationAgent",
      "status": "PASSED",
      "message": "All required document types are present.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "LAB_REPORT",
          "HOSPITAL_BILL"
        ],
        "optional": [
          "DISCHARGE_SUMMARY"
        ],
        "present": [
          "PRESCRIPTION",
          "LAB_REPORT",
          "HOSPITAL_BILL"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from PRESCRIPTION.",
      "details": {
        "documentId": "F012",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": true,
          "providerName": false,
          "diagnosis": true,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from LAB_REPORT.",
      "details": {
        "documentId": "F013",
        "declaredType": "LAB_REPORT",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": false,
          "diagnosis": false,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from HOSPITAL_BILL.",
      "details": {
        "documentId": "F014",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": false,
          "doctorName": false,
          "providerName": false,
          "diagnosis": false,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ConsistencyAgent",
      "status": "PASSED",
      "message": "Document patient identity checks passed.",
      "details": {
        "patientNames": []
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "PolicyEvaluationAgent",
      "status": "FAILED",
      "message": "Policy checks completed.",
      "details": {
        "passed": 6,
        "failed": 3,
        "warnings": 0,
        "checks": [
          {
            "name": "member_eligibility",
            "status": "PASSED",
            "message": "Member exists in policy roster.",
            "details": {
              "memberId": "EMP007"
            }
          },
          {
            "name": "initial_waiting_period",
            "status": "PASSED",
            "message": "Member has 215 days since join; policy requires 30.",
            "details": {
              "daysSinceJoin": 215
            }
          },
          {
            "name": "category_covered",
            "status": "PASSED",
            "message": "DIAGNOSTIC is covered.",
            "details": {
              "categoryKey": "diagnostic"
            }
          },
          {
            "name": "minimum_claim_amount",
            "status": "PASSED",
            "message": "Claimed amount is 15000; minimum is 500.",
            "details": {}
          },
          {
            "name": "per_claim_limit",
            "status": "FAILED",
            "message": "Claimed amount 15000 exceeds per-claim limit 5000.",
            "details": {}
          },
          {
            "name": "submission_deadline",
            "status": "PASSED",
            "message": "Submitted 0 days after treatment; allowed 30.",
            "details": {
              "daysToSubmit": 0
            }
          },
          {
            "name": "category_sub_limit",
            "status": "FAILED",
            "message": "Claimed amount 15000 checked against diagnostic sub-limit 10000.",
            "details": {
              "subLimit": 10000
            }
          },
          {
            "name": "exclusion_screen",
            "status": "PASSED",
            "message": "No configured exclusion matched extracted text.",
            "details": {}
          },
          {
            "name": "pre_authorization",
            "status": "FAILED",
            "message": "High-value diagnostic test requires pre-authorization but none was supplied. Please resubmit with a valid pre-authorization approval.",
            "details": {
              "tests": [
                "MRI Lumbar Spine",
                "MRI",
                "MRI Lumbar Spine",
                "MRI",
                "MRI"
              ],
              "threshold": 10000
            }
          }
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Final decision: REJECTED.",
      "details": {
        "decision": "REJECTED",
        "approvedAmount": 0,
        "confidence": 0.94,
        "reason": "Claimed amount 15000 exceeds per-claim limit 5000. Claimed amount 15000 checked against diagnostic sub-limit 10000. High-value diagnostic test requires pre-authorization but none was supplied. Please resubmit with a valid pre-authorization approval."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [PASSED]: All required document types are present.
- **ExtractionAgent** [PASSED]: Extracted structured fields from PRESCRIPTION.
- **ExtractionAgent** [PASSED]: Extracted structured fields from LAB_REPORT.
- **ExtractionAgent** [PASSED]: Extracted structured fields from HOSPITAL_BILL.
- **ConsistencyAgent** [PASSED]: Document patient identity checks passed.
- **PolicyEvaluationAgent** [FAILED]: Policy checks completed.
- **DecisionAgent** [PASSED]: Final decision: REJECTED.

### TC008: Per-Claim Limit Exceeded

Expected: REJECTED; Actual: REJECTED; Matched: Yes


```json
{
  "claimId": "TC008",
  "decision": "REJECTED",
  "approvedAmount": 0,
  "reason": "Claimed amount 7500 exceeds per-claim limit 5000.",
  "confidence": 0.94,
  "verification": {
    "ok": true,
    "errors": [],
    "required": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ],
    "optional": [
      "LAB_REPORT",
      "DIAGNOSTIC_REPORT"
    ],
    "present": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ]
  },
  "extracted": {
    "patient": {
      "name": "Dr"
    },
    "diagnosis": [
      "Gastroenteritis",
      "Gastroenteritis"
    ],
    "procedures": [],
    "medicines": [
      "Antibiotics",
      "Probiotics",
      "ORS"
    ],
    "tests": [],
    "providers": [
      {
        "role": "doctor",
        "name": "Dr. R. Gupta"
      }
    ],
    "documentAmounts": [
      {
        "documentId": "F016",
        "documentType": "HOSPITAL_BILL",
        "amount": 7500
      }
    ],
    "dates": [],
    "qualityIssues": [],
    "rawSignals": [
      {
        "documentId": "F015",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 125
      },
      {
        "documentId": "F016",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "PHARMACY_BILL",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 60
      }
    ],
    "lineItems": [
      {
        "documentId": "F016",
        "documentType": "HOSPITAL_BILL",
        "description": "Consultation Fee",
        "amount": 2000
      },
      {
        "documentId": "F016",
        "documentType": "HOSPITAL_BILL",
        "description": "Medicines",
        "amount": 5500
      }
    ],
    "totalDocumentAmount": 7500
  },
  "checks": [
    {
      "name": "member_eligibility",
      "status": "PASSED",
      "message": "Member exists in policy roster.",
      "details": {
        "memberId": "EMP003"
      }
    },
    {
      "name": "initial_waiting_period",
      "status": "PASSED",
      "message": "Member has 202 days since join; policy requires 30.",
      "details": {
        "daysSinceJoin": 202
      }
    },
    {
      "name": "category_covered",
      "status": "PASSED",
      "message": "CONSULTATION is covered.",
      "details": {
        "categoryKey": "consultation"
      }
    },
    {
      "name": "minimum_claim_amount",
      "status": "PASSED",
      "message": "Claimed amount is 7500; minimum is 500.",
      "details": {}
    },
    {
      "name": "per_claim_limit",
      "status": "FAILED",
      "message": "Claimed amount 7500 exceeds per-claim limit 5000.",
      "details": {}
    },
    {
      "name": "submission_deadline",
      "status": "PASSED",
      "message": "Submitted 0 days after treatment; allowed 30.",
      "details": {
        "daysToSubmit": 0
      }
    },
    {
      "name": "exclusion_screen",
      "status": "PASSED",
      "message": "No configured exclusion matched extracted text.",
      "details": {}
    }
  ],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC008",
        "memberId": "EMP003",
        "treatmentType": "CONSULTATION",
        "claimedAmount": 7500,
        "documentCount": 2
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "DocumentVerificationAgent",
      "status": "PASSED",
      "message": "All required document types are present.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ],
        "optional": [
          "LAB_REPORT",
          "DIAGNOSTIC_REPORT"
        ],
        "present": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from PRESCRIPTION.",
      "details": {
        "documentId": "F015",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": false,
          "diagnosis": true,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from HOSPITAL_BILL.",
      "details": {
        "documentId": "F016",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "PHARMACY_BILL",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": false,
          "doctorName": false,
          "providerName": false,
          "diagnosis": false,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.897Z",
      "component": "ConsistencyAgent",
      "status": "PASSED",
      "message": "Document patient identity checks passed.",
      "details": {
        "patientNames": []
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "PolicyEvaluationAgent",
      "status": "FAILED",
      "message": "Policy checks completed.",
      "details": {
        "passed": 6,
        "failed": 1,
        "warnings": 0,
        "checks": [
          {
            "name": "member_eligibility",
            "status": "PASSED",
            "message": "Member exists in policy roster.",
            "details": {
              "memberId": "EMP003"
            }
          },
          {
            "name": "initial_waiting_period",
            "status": "PASSED",
            "message": "Member has 202 days since join; policy requires 30.",
            "details": {
              "daysSinceJoin": 202
            }
          },
          {
            "name": "category_covered",
            "status": "PASSED",
            "message": "CONSULTATION is covered.",
            "details": {
              "categoryKey": "consultation"
            }
          },
          {
            "name": "minimum_claim_amount",
            "status": "PASSED",
            "message": "Claimed amount is 7500; minimum is 500.",
            "details": {}
          },
          {
            "name": "per_claim_limit",
            "status": "FAILED",
            "message": "Claimed amount 7500 exceeds per-claim limit 5000.",
            "details": {}
          },
          {
            "name": "submission_deadline",
            "status": "PASSED",
            "message": "Submitted 0 days after treatment; allowed 30.",
            "details": {
              "daysToSubmit": 0
            }
          },
          {
            "name": "exclusion_screen",
            "status": "PASSED",
            "message": "No configured exclusion matched extracted text.",
            "details": {}
          }
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Final decision: REJECTED.",
      "details": {
        "decision": "REJECTED",
        "approvedAmount": 0,
        "confidence": 0.94,
        "reason": "Claimed amount 7500 exceeds per-claim limit 5000."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [PASSED]: All required document types are present.
- **ExtractionAgent** [PASSED]: Extracted structured fields from PRESCRIPTION.
- **ExtractionAgent** [PASSED]: Extracted structured fields from HOSPITAL_BILL.
- **ConsistencyAgent** [PASSED]: Document patient identity checks passed.
- **PolicyEvaluationAgent** [FAILED]: Policy checks completed.
- **DecisionAgent** [PASSED]: Final decision: REJECTED.

### TC009: Fraud Signal — Multiple Same-Day Claims

Expected: MANUAL_REVIEW; Actual: MANUAL_REVIEW; Matched: Yes


```json
{
  "claimId": "TC009",
  "decision": "MANUAL_REVIEW",
  "approvedAmount": 0,
  "reason": "One or more documents had low readability; confidence reduced. Member already has 3 claims on 2024-10-30; this exceeds same-day claim threshold 2.",
  "confidence": 0.35,
  "verification": {
    "ok": true,
    "errors": [],
    "required": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ],
    "optional": [
      "LAB_REPORT",
      "DIAGNOSTIC_REPORT"
    ],
    "present": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ]
  },
  "extracted": {
    "patient": {
      "name": "Dr"
    },
    "diagnosis": [
      "Migraine",
      "Migraine"
    ],
    "procedures": [],
    "medicines": [],
    "tests": [],
    "providers": [
      {
        "role": "doctor",
        "name": "Dr. S. Khan"
      }
    ],
    "documentAmounts": [
      {
        "documentId": "F018",
        "documentType": "HOSPITAL_BILL",
        "amount": 4800
      }
    ],
    "dates": [],
    "qualityIssues": [
      {
        "documentId": "F018",
        "documentType": "HOSPITAL_BILL",
        "issue": "Low readability or insufficient text",
        "qualityScore": 0.45
      }
    ],
    "rawSignals": [
      {
        "documentId": "F017",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 44
      },
      {
        "documentId": "F018",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.45,
        "hasText": true,
        "textLength": 11
      }
    ],
    "totalDocumentAmount": 4800
  },
  "checks": [
    {
      "name": "member_eligibility",
      "status": "PASSED",
      "message": "Member exists in policy roster.",
      "details": {
        "memberId": "EMP008"
      }
    },
    {
      "name": "initial_waiting_period",
      "status": "PASSED",
      "message": "Member has 212 days since join; policy requires 30.",
      "details": {
        "daysSinceJoin": 212
      }
    },
    {
      "name": "category_covered",
      "status": "PASSED",
      "message": "CONSULTATION is covered.",
      "details": {
        "categoryKey": "consultation"
      }
    },
    {
      "name": "minimum_claim_amount",
      "status": "PASSED",
      "message": "Claimed amount is 4800; minimum is 500.",
      "details": {}
    },
    {
      "name": "per_claim_limit",
      "status": "PASSED",
      "message": "Claimed amount 4800 exceeds per-claim limit 5000.",
      "details": {}
    },
    {
      "name": "submission_deadline",
      "status": "PASSED",
      "message": "Submitted 0 days after treatment; allowed 30.",
      "details": {
        "daysToSubmit": 0
      }
    },
    {
      "name": "exclusion_screen",
      "status": "PASSED",
      "message": "No configured exclusion matched extracted text.",
      "details": {}
    },
    {
      "name": "document_quality",
      "status": "WARN",
      "message": "One or more documents had low readability; confidence reduced.",
      "details": {
        "qualityIssues": [
          {
            "documentId": "F018",
            "documentType": "HOSPITAL_BILL",
            "issue": "Low readability or insufficient text",
            "qualityScore": 0.45
          }
        ]
      },
      "manualReview": false
    },
    {
      "name": "same_day_claim_pattern",
      "status": "WARN",
      "message": "Member already has 3 claims on 2024-10-30; this exceeds same-day claim threshold 2.",
      "details": {
        "sameDayClaims": [
          {
            "claim_id": "CLM_0081",
            "date": "2024-10-30",
            "amount": 1200,
            "provider": "City Clinic A"
          },
          {
            "claim_id": "CLM_0082",
            "date": "2024-10-30",
            "amount": 1800,
            "provider": "City Clinic B"
          },
          {
            "claim_id": "CLM_0083",
            "date": "2024-10-30",
            "amount": 2100,
            "provider": "Wellness Center"
          }
        ]
      },
      "manualReview": true
    }
  ],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC009",
        "memberId": "EMP008",
        "treatmentType": "CONSULTATION",
        "claimedAmount": 4800,
        "documentCount": 2
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "DocumentVerificationAgent",
      "status": "PASSED",
      "message": "All required document types are present.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ],
        "optional": [
          "LAB_REPORT",
          "DIAGNOSTIC_REPORT"
        ],
        "present": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from PRESCRIPTION.",
      "details": {
        "documentId": "F017",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": false,
          "diagnosis": true,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "ExtractionAgent",
      "status": "DEGRADED",
      "message": "Extracted structured fields from HOSPITAL_BILL.",
      "details": {
        "documentId": "F018",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.45,
        "fieldsFound": {
          "patientName": false,
          "doctorName": false,
          "providerName": false,
          "diagnosis": false,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "ConsistencyAgent",
      "status": "PASSED",
      "message": "Document patient identity checks passed.",
      "details": {
        "patientNames": []
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "PolicyEvaluationAgent",
      "status": "WARN",
      "message": "Policy checks completed.",
      "details": {
        "passed": 7,
        "failed": 0,
        "warnings": 2,
        "checks": [
          {
            "name": "member_eligibility",
            "status": "PASSED",
            "message": "Member exists in policy roster.",
            "details": {
              "memberId": "EMP008"
            }
          },
          {
            "name": "initial_waiting_period",
            "status": "PASSED",
            "message": "Member has 212 days since join; policy requires 30.",
            "details": {
              "daysSinceJoin": 212
            }
          },
          {
            "name": "category_covered",
            "status": "PASSED",
            "message": "CONSULTATION is covered.",
            "details": {
              "categoryKey": "consultation"
            }
          },
          {
            "name": "minimum_claim_amount",
            "status": "PASSED",
            "message": "Claimed amount is 4800; minimum is 500.",
            "details": {}
          },
          {
            "name": "per_claim_limit",
            "status": "PASSED",
            "message": "Claimed amount 4800 exceeds per-claim limit 5000.",
            "details": {}
          },
          {
            "name": "submission_deadline",
            "status": "PASSED",
            "message": "Submitted 0 days after treatment; allowed 30.",
            "details": {
              "daysToSubmit": 0
            }
          },
          {
            "name": "exclusion_screen",
            "status": "PASSED",
            "message": "No configured exclusion matched extracted text.",
            "details": {}
          },
          {
            "name": "document_quality",
            "status": "WARN",
            "message": "One or more documents had low readability; confidence reduced.",
            "details": {
              "qualityIssues": [
                {
                  "documentId": "F018",
                  "documentType": "HOSPITAL_BILL",
                  "issue": "Low readability or insufficient text",
                  "qualityScore": 0.45
                }
              ]
            },
            "manualReview": false
          },
          {
            "name": "same_day_claim_pattern",
            "status": "WARN",
            "message": "Member already has 3 claims on 2024-10-30; this exceeds same-day claim threshold 2.",
            "details": {
              "sameDayClaims": [
                {
                  "claim_id": "CLM_0081",
                  "date": "2024-10-30",
                  "amount": 1200,
                  "provider": "City Clinic A"
                },
                {
                  "claim_id": "CLM_0082",
                  "date": "2024-10-30",
                  "amount": 1800,
                  "provider": "City Clinic B"
                },
                {
                  "claim_id": "CLM_0083",
                  "date": "2024-10-30",
                  "amount": 2100,
                  "provider": "Wellness Center"
                }
              ]
            },
            "manualReview": true
          }
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Final decision: MANUAL_REVIEW.",
      "details": {
        "decision": "MANUAL_REVIEW",
        "approvedAmount": 0,
        "confidence": 0.35,
        "reason": "One or more documents had low readability; confidence reduced. Member already has 3 claims on 2024-10-30; this exceeds same-day claim threshold 2."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [PASSED]: All required document types are present.
- **ExtractionAgent** [PASSED]: Extracted structured fields from PRESCRIPTION.
- **ExtractionAgent** [DEGRADED]: Extracted structured fields from HOSPITAL_BILL.
- **ConsistencyAgent** [PASSED]: Document patient identity checks passed.
- **PolicyEvaluationAgent** [WARN]: Policy checks completed.
- **DecisionAgent** [PASSED]: Final decision: MANUAL_REVIEW.

### TC010: Network Hospital — Discount Applied

Expected: APPROVED; Actual: APPROVED; Matched: Yes


```json
{
  "claimId": "TC010",
  "decision": "APPROVED",
  "approvedAmount": 3240,
  "reason": "All required policy checks passed.",
  "confidence": 0.9,
  "verification": {
    "ok": true,
    "errors": [],
    "required": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ],
    "optional": [
      "LAB_REPORT",
      "DIAGNOSTIC_REPORT"
    ],
    "present": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ]
  },
  "extracted": {
    "patient": {
      "name": "Apollo Hospitals"
    },
    "diagnosis": [
      "Acute Bronchitis",
      "Acute Bronchitis"
    ],
    "procedures": [],
    "medicines": [
      "Amoxicillin 500mg",
      "Salbutamol Inhaler"
    ],
    "tests": [],
    "providers": [
      {
        "role": "doctor",
        "name": "Dr. S. Iyer"
      },
      {
        "role": "facility",
        "name": "Apollo Hospitals"
      },
      {
        "role": "facility",
        "name": "hospital_name: Apollo Hospitals"
      }
    ],
    "documentAmounts": [
      {
        "documentId": "F020",
        "documentType": "HOSPITAL_BILL",
        "amount": 4500
      }
    ],
    "dates": [],
    "qualityIssues": [],
    "rawSignals": [
      {
        "documentId": "F019",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 161
      },
      {
        "documentId": "F020",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "HOSPITAL_BILL",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 118
      }
    ],
    "lineItems": [
      {
        "documentId": "F020",
        "documentType": "HOSPITAL_BILL",
        "description": "Consultation Fee",
        "amount": 1500
      },
      {
        "documentId": "F020",
        "documentType": "HOSPITAL_BILL",
        "description": "Medicines",
        "amount": 3000
      }
    ],
    "totalDocumentAmount": 4500
  },
  "checks": [
    {
      "name": "member_eligibility",
      "status": "PASSED",
      "message": "Member exists in policy roster.",
      "details": {
        "memberId": "EMP010"
      }
    },
    {
      "name": "initial_waiting_period",
      "status": "PASSED",
      "message": "Member has 216 days since join; policy requires 30.",
      "details": {
        "daysSinceJoin": 216
      }
    },
    {
      "name": "category_covered",
      "status": "PASSED",
      "message": "CONSULTATION is covered.",
      "details": {
        "categoryKey": "consultation"
      }
    },
    {
      "name": "minimum_claim_amount",
      "status": "PASSED",
      "message": "Claimed amount is 4500; minimum is 500.",
      "details": {}
    },
    {
      "name": "per_claim_limit",
      "status": "PASSED",
      "message": "Claimed amount 4500 exceeds per-claim limit 5000.",
      "details": {}
    },
    {
      "name": "submission_deadline",
      "status": "PASSED",
      "message": "Submitted 0 days after treatment; allowed 30.",
      "details": {
        "daysToSubmit": 0
      }
    },
    {
      "name": "exclusion_screen",
      "status": "PASSED",
      "message": "No configured exclusion matched extracted text.",
      "details": {}
    }
  ],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC010",
        "memberId": "EMP010",
        "treatmentType": "CONSULTATION",
        "claimedAmount": 4500,
        "documentCount": 2
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "DocumentVerificationAgent",
      "status": "PASSED",
      "message": "All required document types are present.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ],
        "optional": [
          "LAB_REPORT",
          "DIAGNOSTIC_REPORT"
        ],
        "present": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from PRESCRIPTION.",
      "details": {
        "documentId": "F019",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": false,
          "diagnosis": true,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from HOSPITAL_BILL.",
      "details": {
        "documentId": "F020",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "HOSPITAL_BILL",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": true,
          "diagnosis": false,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "ConsistencyAgent",
      "status": "PASSED",
      "message": "Document patient identity checks passed.",
      "details": {
        "patientNames": [
          "Deepak Shah"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "PolicyEvaluationAgent",
      "status": "PASSED",
      "message": "Policy checks completed.",
      "details": {
        "passed": 7,
        "failed": 0,
        "warnings": 0,
        "checks": [
          {
            "name": "member_eligibility",
            "status": "PASSED",
            "message": "Member exists in policy roster.",
            "details": {
              "memberId": "EMP010"
            }
          },
          {
            "name": "initial_waiting_period",
            "status": "PASSED",
            "message": "Member has 216 days since join; policy requires 30.",
            "details": {
              "daysSinceJoin": 216
            }
          },
          {
            "name": "category_covered",
            "status": "PASSED",
            "message": "CONSULTATION is covered.",
            "details": {
              "categoryKey": "consultation"
            }
          },
          {
            "name": "minimum_claim_amount",
            "status": "PASSED",
            "message": "Claimed amount is 4500; minimum is 500.",
            "details": {}
          },
          {
            "name": "per_claim_limit",
            "status": "PASSED",
            "message": "Claimed amount 4500 exceeds per-claim limit 5000.",
            "details": {}
          },
          {
            "name": "submission_deadline",
            "status": "PASSED",
            "message": "Submitted 0 days after treatment; allowed 30.",
            "details": {
              "daysToSubmit": 0
            }
          },
          {
            "name": "exclusion_screen",
            "status": "PASSED",
            "message": "No configured exclusion matched extracted text.",
            "details": {}
          }
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Final decision: APPROVED.",
      "details": {
        "decision": "APPROVED",
        "approvedAmount": 3240,
        "confidence": 0.9,
        "reason": "All required policy checks passed."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [PASSED]: All required document types are present.
- **ExtractionAgent** [PASSED]: Extracted structured fields from PRESCRIPTION.
- **ExtractionAgent** [PASSED]: Extracted structured fields from HOSPITAL_BILL.
- **ConsistencyAgent** [PASSED]: Document patient identity checks passed.
- **PolicyEvaluationAgent** [PASSED]: Policy checks completed.
- **DecisionAgent** [PASSED]: Final decision: APPROVED.

### TC011: Component Failure — Graceful Degradation

Expected: APPROVED; Actual: APPROVED; Matched: Yes


```json
{
  "claimId": "TC011",
  "decision": "APPROVED",
  "approvedAmount": 4000,
  "reason": "All required policy checks passed. Manual review is recommended because one processing component was skipped.",
  "confidence": 0.78,
  "verification": {
    "ok": true,
    "errors": [],
    "required": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ],
    "optional": [],
    "present": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ]
  },
  "extracted": {
    "patient": {
      "name": "Ayur Wellness Centre"
    },
    "diagnosis": [
      "Chronic Joint Pain",
      "Chronic Joint Pain"
    ],
    "procedures": [
      "Panchakarma Therapy",
      "Panchakarma Therapy"
    ],
    "medicines": [],
    "tests": [],
    "providers": [
      {
        "role": "doctor",
        "name": "Vaidya T. Krishnan"
      },
      {
        "role": "facility",
        "name": "Ayur Wellness Centre"
      },
      {
        "role": "facility",
        "name": "hospital_name: Ayur Wellness Centre"
      }
    ],
    "documentAmounts": [
      {
        "documentId": "F022",
        "documentType": "HOSPITAL_BILL",
        "amount": 4000
      }
    ],
    "dates": [],
    "qualityIssues": [],
    "rawSignals": [
      {
        "documentId": "F021",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 131
      },
      {
        "documentId": "F022",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "HOSPITAL_BILL",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 115
      }
    ],
    "lineItems": [
      {
        "documentId": "F022",
        "documentType": "HOSPITAL_BILL",
        "description": "Panchakarma Therapy (5 sessions)",
        "amount": 3000
      },
      {
        "documentId": "F022",
        "documentType": "HOSPITAL_BILL",
        "description": "Consultation",
        "amount": 1000
      }
    ],
    "totalDocumentAmount": 4000
  },
  "checks": [
    {
      "name": "member_eligibility",
      "status": "PASSED",
      "message": "Member exists in policy roster.",
      "details": {
        "memberId": "EMP006"
      }
    },
    {
      "name": "initial_waiting_period",
      "status": "PASSED",
      "message": "Member has 210 days since join; policy requires 30.",
      "details": {
        "daysSinceJoin": 210
      }
    },
    {
      "name": "category_covered",
      "status": "PASSED",
      "message": "ALTERNATIVE_MEDICINE is covered.",
      "details": {
        "categoryKey": "alternative_medicine"
      }
    },
    {
      "name": "minimum_claim_amount",
      "status": "PASSED",
      "message": "Claimed amount is 4000; minimum is 500.",
      "details": {}
    },
    {
      "name": "per_claim_limit",
      "status": "PASSED",
      "message": "Claimed amount 4000 exceeds per-claim limit 5000.",
      "details": {}
    },
    {
      "name": "submission_deadline",
      "status": "PASSED",
      "message": "Submitted 0 days after treatment; allowed 30.",
      "details": {
        "daysToSubmit": 0
      }
    },
    {
      "name": "category_sub_limit",
      "status": "PASSED",
      "message": "Claimed amount 4000 checked against alternative_medicine sub-limit 8000.",
      "details": {
        "subLimit": 8000
      }
    },
    {
      "name": "exclusion_screen",
      "status": "PASSED",
      "message": "No configured exclusion matched extracted text.",
      "details": {}
    },
    {
      "name": "alternative_system",
      "status": "PASSED",
      "message": "Alternative medicine system is covered.",
      "details": {
        "coveredSystems": [
          "Ayurveda",
          "Homeopathy",
          "Unani",
          "Siddha",
          "Naturopathy"
        ]
      }
    },
    {
      "name": "registered_practitioner",
      "status": "PASSED",
      "message": "Practitioner registration was found.",
      "details": {}
    }
  ],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC011",
        "memberId": "EMP006",
        "treatmentType": "ALTERNATIVE_MEDICINE",
        "claimedAmount": 4000,
        "documentCount": 2
      }
    },
    {
      "at": "2026-05-31T16:57:32.898Z",
      "component": "DocumentVerificationAgent",
      "status": "PASSED",
      "message": "All required document types are present.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ],
        "optional": [],
        "present": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from PRESCRIPTION.",
      "details": {
        "documentId": "F021",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": false,
          "diagnosis": true,
          "procedure": true,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from HOSPITAL_BILL.",
      "details": {
        "documentId": "F022",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "HOSPITAL_BILL",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": true,
          "diagnosis": false,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "ConsistencyAgent",
      "status": "PASSED",
      "message": "Document patient identity checks passed.",
      "details": {
        "patientNames": []
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "ExtractionAgent",
      "status": "DEGRADED",
      "message": "Simulated extraction sub-component failure; continuing with structured document content and reduced confidence.",
      "details": {
        "recommendation": "Manual review recommended because processing was incomplete."
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "PolicyEvaluationAgent",
      "status": "PASSED",
      "message": "Policy checks completed.",
      "details": {
        "passed": 10,
        "failed": 0,
        "warnings": 0,
        "checks": [
          {
            "name": "member_eligibility",
            "status": "PASSED",
            "message": "Member exists in policy roster.",
            "details": {
              "memberId": "EMP006"
            }
          },
          {
            "name": "initial_waiting_period",
            "status": "PASSED",
            "message": "Member has 210 days since join; policy requires 30.",
            "details": {
              "daysSinceJoin": 210
            }
          },
          {
            "name": "category_covered",
            "status": "PASSED",
            "message": "ALTERNATIVE_MEDICINE is covered.",
            "details": {
              "categoryKey": "alternative_medicine"
            }
          },
          {
            "name": "minimum_claim_amount",
            "status": "PASSED",
            "message": "Claimed amount is 4000; minimum is 500.",
            "details": {}
          },
          {
            "name": "per_claim_limit",
            "status": "PASSED",
            "message": "Claimed amount 4000 exceeds per-claim limit 5000.",
            "details": {}
          },
          {
            "name": "submission_deadline",
            "status": "PASSED",
            "message": "Submitted 0 days after treatment; allowed 30.",
            "details": {
              "daysToSubmit": 0
            }
          },
          {
            "name": "category_sub_limit",
            "status": "PASSED",
            "message": "Claimed amount 4000 checked against alternative_medicine sub-limit 8000.",
            "details": {
              "subLimit": 8000
            }
          },
          {
            "name": "exclusion_screen",
            "status": "PASSED",
            "message": "No configured exclusion matched extracted text.",
            "details": {}
          },
          {
            "name": "alternative_system",
            "status": "PASSED",
            "message": "Alternative medicine system is covered.",
            "details": {
              "coveredSystems": [
                "Ayurveda",
                "Homeopathy",
                "Unani",
                "Siddha",
                "Naturopathy"
              ]
            }
          },
          {
            "name": "registered_practitioner",
            "status": "PASSED",
            "message": "Practitioner registration was found.",
            "details": {}
          }
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Final decision: APPROVED.",
      "details": {
        "decision": "APPROVED",
        "approvedAmount": 4000,
        "confidence": 0.78,
        "reason": "All required policy checks passed. Manual review is recommended because one processing component was skipped."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [PASSED]: All required document types are present.
- **ExtractionAgent** [PASSED]: Extracted structured fields from PRESCRIPTION.
- **ExtractionAgent** [PASSED]: Extracted structured fields from HOSPITAL_BILL.
- **ConsistencyAgent** [PASSED]: Document patient identity checks passed.
- **ExtractionAgent** [DEGRADED]: Simulated extraction sub-component failure; continuing with structured document content and reduced confidence.
- **PolicyEvaluationAgent** [PASSED]: Policy checks completed.
- **DecisionAgent** [PASSED]: Final decision: APPROVED.

### TC012: Excluded Treatment

Expected: REJECTED; Actual: REJECTED; Matched: Yes


```json
{
  "claimId": "TC012",
  "decision": "REJECTED",
  "approvedAmount": 0,
  "reason": "Claimed amount 8000 exceeds per-claim limit 5000. Claim appears related to excluded item: Obesity and weight loss programs.",
  "confidence": 0.94,
  "verification": {
    "ok": true,
    "errors": [],
    "required": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ],
    "optional": [
      "LAB_REPORT",
      "DIAGNOSTIC_REPORT"
    ],
    "present": [
      "PRESCRIPTION",
      "HOSPITAL_BILL"
    ]
  },
  "extracted": {
    "patient": {
      "name": "Dr"
    },
    "diagnosis": [
      "Morbid Obesity — BMI 37",
      "Morbid Obesity"
    ],
    "procedures": [
      "Bariatric Consultation and Customised Diet Plan",
      "Bariatric Consultation and Customised Diet Plan"
    ],
    "medicines": [],
    "tests": [],
    "providers": [
      {
        "role": "doctor",
        "name": "Dr. P. Banerjee"
      }
    ],
    "documentAmounts": [
      {
        "documentId": "F024",
        "documentType": "HOSPITAL_BILL",
        "amount": 8000
      }
    ],
    "dates": [],
    "qualityIssues": [],
    "rawSignals": [
      {
        "documentId": "F023",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 157
      },
      {
        "documentId": "F024",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.88,
        "hasText": true,
        "textLength": 96
      }
    ],
    "lineItems": [
      {
        "documentId": "F024",
        "documentType": "HOSPITAL_BILL",
        "description": "Bariatric Consultation",
        "amount": 3000
      },
      {
        "documentId": "F024",
        "documentType": "HOSPITAL_BILL",
        "description": "Personalised Diet and Nutrition Program",
        "amount": 5000
      }
    ],
    "totalDocumentAmount": 8000
  },
  "checks": [
    {
      "name": "member_eligibility",
      "status": "PASSED",
      "message": "Member exists in policy roster.",
      "details": {
        "memberId": "EMP009"
      }
    },
    {
      "name": "initial_waiting_period",
      "status": "PASSED",
      "message": "Member has 200 days since join; policy requires 30.",
      "details": {
        "daysSinceJoin": 200
      }
    },
    {
      "name": "category_covered",
      "status": "PASSED",
      "message": "CONSULTATION is covered.",
      "details": {
        "categoryKey": "consultation"
      }
    },
    {
      "name": "minimum_claim_amount",
      "status": "PASSED",
      "message": "Claimed amount is 8000; minimum is 500.",
      "details": {}
    },
    {
      "name": "per_claim_limit",
      "status": "FAILED",
      "message": "Claimed amount 8000 exceeds per-claim limit 5000.",
      "details": {}
    },
    {
      "name": "submission_deadline",
      "status": "PASSED",
      "message": "Submitted 0 days after treatment; allowed 30.",
      "details": {
        "daysToSubmit": 0
      }
    },
    {
      "name": "exclusion_screen",
      "status": "FAILED",
      "message": "Claim appears related to excluded item: Obesity and weight loss programs.",
      "details": {
        "matched": "Obesity and weight loss programs"
      }
    }
  ],
  "trace": [
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "IntakeAgent",
      "status": "PASSED",
      "message": "Claim intake normalized.",
      "details": {
        "claimId": "TC012",
        "memberId": "EMP009",
        "treatmentType": "CONSULTATION",
        "claimedAmount": 8000,
        "documentCount": 2
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "DocumentVerificationAgent",
      "status": "PASSED",
      "message": "All required document types are present.",
      "details": {
        "required": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ],
        "optional": [
          "LAB_REPORT",
          "DIAGNOSTIC_REPORT"
        ],
        "present": [
          "PRESCRIPTION",
          "HOSPITAL_BILL"
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from PRESCRIPTION.",
      "details": {
        "documentId": "F023",
        "declaredType": "PRESCRIPTION",
        "inferredType": "PRESCRIPTION",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": true,
          "doctorName": false,
          "providerName": false,
          "diagnosis": true,
          "procedure": true,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "ExtractionAgent",
      "status": "PASSED",
      "message": "Extracted structured fields from HOSPITAL_BILL.",
      "details": {
        "documentId": "F024",
        "declaredType": "HOSPITAL_BILL",
        "inferredType": "UNKNOWN",
        "qualityScore": 0.88,
        "fieldsFound": {
          "patientName": false,
          "doctorName": false,
          "providerName": false,
          "diagnosis": false,
          "procedure": false,
          "dates": 0,
          "amounts": 0
        }
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "ConsistencyAgent",
      "status": "PASSED",
      "message": "Document patient identity checks passed.",
      "details": {
        "patientNames": []
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "PolicyEvaluationAgent",
      "status": "FAILED",
      "message": "Policy checks completed.",
      "details": {
        "passed": 5,
        "failed": 2,
        "warnings": 0,
        "checks": [
          {
            "name": "member_eligibility",
            "status": "PASSED",
            "message": "Member exists in policy roster.",
            "details": {
              "memberId": "EMP009"
            }
          },
          {
            "name": "initial_waiting_period",
            "status": "PASSED",
            "message": "Member has 200 days since join; policy requires 30.",
            "details": {
              "daysSinceJoin": 200
            }
          },
          {
            "name": "category_covered",
            "status": "PASSED",
            "message": "CONSULTATION is covered.",
            "details": {
              "categoryKey": "consultation"
            }
          },
          {
            "name": "minimum_claim_amount",
            "status": "PASSED",
            "message": "Claimed amount is 8000; minimum is 500.",
            "details": {}
          },
          {
            "name": "per_claim_limit",
            "status": "FAILED",
            "message": "Claimed amount 8000 exceeds per-claim limit 5000.",
            "details": {}
          },
          {
            "name": "submission_deadline",
            "status": "PASSED",
            "message": "Submitted 0 days after treatment; allowed 30.",
            "details": {
              "daysToSubmit": 0
            }
          },
          {
            "name": "exclusion_screen",
            "status": "FAILED",
            "message": "Claim appears related to excluded item: Obesity and weight loss programs.",
            "details": {
              "matched": "Obesity and weight loss programs"
            }
          }
        ]
      }
    },
    {
      "at": "2026-05-31T16:57:32.899Z",
      "component": "DecisionAgent",
      "status": "PASSED",
      "message": "Final decision: REJECTED.",
      "details": {
        "decision": "REJECTED",
        "approvedAmount": 0,
        "confidence": 0.94,
        "reason": "Claimed amount 8000 exceeds per-claim limit 5000. Claim appears related to excluded item: Obesity and weight loss programs."
      }
    }
  ]
}
```

- **IntakeAgent** [PASSED]: Claim intake normalized.
- **DocumentVerificationAgent** [PASSED]: All required document types are present.
- **ExtractionAgent** [PASSED]: Extracted structured fields from PRESCRIPTION.
- **ExtractionAgent** [PASSED]: Extracted structured fields from HOSPITAL_BILL.
- **ConsistencyAgent** [PASSED]: Document patient identity checks passed.
- **PolicyEvaluationAgent** [FAILED]: Policy checks completed.
- **DecisionAgent** [PASSED]: Final decision: REJECTED.
