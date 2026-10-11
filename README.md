# BOOND — Municipal Water-Leak Reporting & Triage Engine

BOOND is a cloud-native water-leak reporting and municipal engineering triage platform. It enables residents to report leaks with GPS coordinates and photos, merges duplicate reports within 30 metres using the Haversine distance formula, prioritizes repairs using flow-rate heuristics, and enforces fine-grained access control with **Cedar authorization policies**.

---

## Architecture Overview

```
[ Citizen / Resident ]                [ Municipal Engineer ]
          │                                     │
          ▼                                     ▼
POST /reports                               GET /tickets (Ranked Queue)
POST /photo-url (Before photo)              POST /photo-url (After photo)
POST /tickets/{id}/dispute                  POST /tickets/{id}/close
          │                                     │
          └──────────────────┬──────────────────┘
                             ▼
              [ Amazon API Gateway HTTP API v2 ]
                             │
                             ▼
                 [ AWS Lambda (Python 3.12) ]
                   ├── Cedar Authorization Engine (cedarpy)
                   ├── Haversine 30m Proximity Clustering
                   └── Heuristic Priority Score Calculator
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
[ Amazon DynamoDB: BoondTickets ]    [ Amazon S3: BoondPhotos ]
     (Tickets & State Graph)            (Private Encrypted Bucket)
```

---

## Cedar Authorization Policies

BOOND uses real policy evaluation powered by the **Cedar policy engine** (`cedarpy`). The policies are located in [`backend/policies/boond.cedar`](file:///d:/BOOND/backend/policies/boond.cedar).

### Core Authorization Rules

| Rule # | Requirement | Cedar Policy ID | Enforcement Behavior |
|---|---|---|---|
| **1** | A resident cannot close a ticket | *Default Deny* | Resident closure attempts fail authorization (`allowed: false`, `decision: Deny`). |
| **2** | An engineer cannot close without an after-repair photo | `engineer_close_ticket` | Denied if `resource.has_after_photo == false`. |
| **3** | An engineer with the required photo can close a ticket | `engineer_close_ticket` | Allowed (`allowed: true`, reason: `engineer_close_ticket`). Records `closed_at` timestamp. |
| **4** | Reopening a closed ticket requires at least two resident disputes | `resident_reopen_ticket` | Evaluated on dispute. If `dispute_count >= 2`, ticket status reopens to `OPEN` and photo proof resets. |
| **5** | Authorization failures must fail closed | *Fail-Closed Guarantee* | Corrupted syntax, missing files, or runtime errors immediately resolve to `allowed: false`, `decision: Deny`. |

### Cedar Policy Definition (`backend/policies/boond.cedar`)

```cedar
// BOOND Cedar Authorization Policies
// Namespace: Boond

@id("engineer_close_ticket")
permit (
    principal == Boond::Role::"engineer",
    action == Boond::Action::"close_ticket",
    resource is Boond::Ticket
)
when {
    resource.has_after_photo == true
};

@id("resident_reopen_ticket")
permit (
    principal == Boond::Role::"resident",
    action == Boond::Action::"reopen_ticket",
    resource is Boond::Ticket
)
when {
    resource.dispute_count >= 2
};
```

---

## Priority & Leakage Estimation Model

BOOND prioritizes repairs using assumed daily leakage-rate ranges based on observed flow rate:

| Flow Category | Estimated Daily Leakage Range | Midpoint Estimate |
|---|---|---|
| **Drip** | 50 – 200 Litres / Day | 125 L/d |
| **Steady** | 500 – 2,000 Litres / Day | 1,250 L/d |
| **Gush** | 4,000 – 15,000 Litres / Day | 9,500 L/d |

### Priority Calculation Formula

$$\text{Priority Score} = \text{Midpoint} \times \text{Drinking Multiplier} \times (1.0 + 0.25 \times (\text{Reporters} - 1))$$

- **Drinking-water priority**: $1.5\times$ multiplier applied if clean drinking water is being lost.
- **Reporter volume**: $+0.25$ increase per additional reporter beyond the initial report.
- **Flow upgrades on merge**: If a subsequent reporter observes a more severe flow (e.g. `gush` vs `steady`), the ticket flow is upgraded and priority is recalculated.

> **Disclaimer**: All leakage rates and priority scores are heuristic triage models based on reported flow rates and reporter counts. They do not constitute verified water volume saved.

---

## API Reference (API Gateway HTTP API v2)

All endpoints accept and return JSON with full CORS headers (`Access-Control-Allow-Origin: *`).

### 1. `GET /tickets`
Retrieves tickets from DynamoDB, filters for `OPEN` status, and ranks them by descending `priority_score`.
Enriches items with presigned photo viewing URLs where available.

**Response (200 OK):**
```json
{
  "count": 10,
  "tickets": [
    {
      "id": "ticket-f2e1a3...",
      "lat": 28.6139,
      "lng": 77.2090,
      "flow": "gush",
      "drinking": true,
      "reporters": 3,
      "status": "OPEN",
      "priority_score": 21375.0,
      "leakage_estimate": {
        "flow_category": "gush",
        "min_litres_per_day": 4000.0,
        "max_litres_per_day": 15000.0,
        "midpoint_litres_per_day": 9500.0,
        "drinking_multiplier": 1.5,
        "reporter_multiplier": 1.5,
        "disclaimer": "..."
      },
      "before_photo_url": "https://...",
      "is_simulated": false
    }
  ],
  "disclaimer": "..."
}
```

### 2. `POST /reports`
Submits a resident leak report. Merges with an existing `OPEN` ticket within 30 metres using the Haversine distance formula; otherwise creates a new ticket.

**Request Body:**
```json
{
  "lat": 28.6139,
  "lng": 77.2090,
  "flow": "steady",
  "drinking": true,
  "photo_key": "photos/before/uuid.jpg"
}
```

### 3. `POST /photo-url`
Returns a presigned S3 PUT URL with a 10-minute expiry (600 seconds) for uploading leak photos.

**Request Body:**
```json
{
  "kind": "before"
}
```

**Response (200 OK):**
```json
{
  "upload_url": "https://boond-photos.s3.amazonaws.com/...",
  "key": "photos/before/4a7f9b8c....jpg",
  "kind": "before",
  "expires_in_seconds": 600
}
```

### 4. `POST /tickets/{id}/close`
Evaluates Cedar policy before changing ticket status. Requires engineer role and an after-repair photo.

**Headers:**
- `X-Boond-Pin: <ENGINEER_PIN>` (Prototype demo authentication)

**Request Body:**
```json
{
  "after_photo_key": "photos/after/proof.jpg"
}
```

**Response (200 OK):**
```json
{
  "status": "closed",
  "message": "Ticket successfully closed following Cedar authorization.",
  "ticket": { ... },
  "authorization": {
    "allowed": true,
    "decision": "Allow",
    "reasons": ["engineer_close_ticket"],
    "errors": []
  }
}
```

**Denial Response (403 Forbidden):**
```json
{
  "error": "Forbidden",
  "message": "Ticket closure denied by Cedar policy...",
  "authorization": {
    "allowed": false,
    "decision": "Deny",
    "reasons": [],
    "errors": []
  }
}
```

### 5. `POST /tickets/{id}/dispute`
Increments dispute count. If ticket is `CLOSED`, evaluates the `reopen_ticket` Cedar action. Reopens to `OPEN` and resets photo proof only when dispute count reaches $\ge 2$.

**Response (200 OK — Reopened):**
```json
{
  "status": "reopened",
  "message": "Ticket reopened following resident dispute threshold.",
  "ticket": {
    "id": "...",
    "status": "OPEN",
    "dispute_count": 2,
    "has_after_photo": false,
    "after_photo_key": null
  },
  "authorization": {
    "allowed": true,
    "decision": "Allow",
    "reasons": ["resident_reopen_ticket"],
    "errors": []
  }
}
```

### 6. `POST /seed`
Engineer-only demo endpoint. Seeds 12 clearly labelled simulated tickets around `DEMO_LAT` and `DEMO_LNG`.

**Headers:**
- `X-Boond-Pin: <ENGINEER_PIN>`

---

## Authentication: Prototype vs. Production Roadmap

> [!WARNING]
> **Prototype Notice**: For this proof of concept, engineer requests are verified using the `X-Boond-Pin` header checked against the `ENGINEER_PIN` environment variable. PIN authentication is for demo purposes only and MUST NOT be used in production.

### Production Authentication Roadmap
For production deployment, PIN authentication must be replaced with:
1. **Amazon Cognito User Pool**:
   - `Residents` group for public reporting and disputes.
   - `MunicipalEngineers` group with MFA for dispatch and ticket closure.
2. **API Gateway HTTP API v2 JWT Authorizer**:
   - Validates Cognito ID/Access tokens at the API gateway layer.
   - Passes verified Cognito identity and group memberships to Lambda in `requestContext.authorizer.jwt.claims`.

---

## Local Development & Testing

### Prerequisites
- Python 3.12+ (or `uv` package manager)
- Windows PowerShell / Linux / macOS

### Setup Virtual Environment
```powershell
uv venv --python 3.12 .venv
.venv\Scripts\activate
uv pip install -r backend/requirements.txt
```

### Running the Test Suite
The test suite runs 100% locally with zero external AWS dependencies:
```powershell
.venv\Scripts\python -m pytest backend/tests -v
```

**Test Coverage Summary:**
- **`backend/tests/test_policy.py`**: 12 Cedar tests covering all five rules (Resident closure deny, Engineer no photo deny, Engineer photo permit, Dispute count threshold $<2$ and $\ge 2$, Fail-closed on syntax/corrupted/missing files).
- **`backend/tests/test_app.py`**: 18 API integration tests covering routing, Haversine merging, flow upgrades, presigned URLs, dispute reopening, seed endpoint, and CORS headers.
- **Total**: 30 passing tests.

---

## AWS SAM Template (`template.yaml`)

The CloudFormation SAM template defines the serverless infrastructure targeting the **Python 3.12** runtime:

- **`BoondHttpApi`**: API Gateway HTTP API v2 with complete CORS configuration.
- **`BoondBackendFunction`**: Python 3.12 Lambda function with least-privilege IAM policies on DynamoDB and S3.
- **`BoondTicketsTable`**: Amazon DynamoDB on-demand table with partition key `id` (String).
- **`BoondPhotosBucket`**: Amazon S3 private bucket with strict public access blocks and CORS for direct uploads.
- **`EngineerPin`**: `NoEcho: true` CloudFormation parameter for demo authorization.
- **`DemoLat` / `DemoLng`**: Configurable municipal reference coordinates.

### Packaging with `build.py` (Windows PowerShell Compatible)
To bundle Linux x86_64 compatible wheels for Lambda without WSL:
```powershell
python build.py --output dist/boond-backend.zip
```
