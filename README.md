# BOOND ? Every Drop Matters. Every Repair Accountable.

**An AWS-powered municipal water-leak reporting, triage, and repair-verification platform.**

BOOND transforms scattered water-leak reports into structured maintenance workflows. Residents can report leaks with location and photo evidence, the system groups nearby reports, a heuristic model prioritizes incidents, and engineer-oriented workflows support evidence-backed ticket closure and dispute review.

Built with AWS serverless services, Python, DynamoDB, S3, and Cedar-based authorization, BOOND explores how cloud architecture can make municipal water maintenance more organized, traceable, and accountable.

**Report. Locate. Prioritize. Verify.**

[GitHub Repository](https://github.com/Ajayrathod04/BOOND) ? [Live Application](https://boond-frontend-351458007747.s3.ap-south-1.amazonaws.com/index.html) ? [Tickets API](https://698gkx4o9a.execute-api.ap-south-1.amazonaws.com/tickets) ? [Environmental Hacks](https://www.wemakedevs.org/aws/env)

---

## Table of Contents

- [The Problem](#the-problem)
- [What BOOND Does](#what-boond-does)
- [Architecture](#architecture)
- [End-to-End Workflows](#end-to-end-workflows)
- [Technology Stack](#technology-stack)
- [Leak Prioritization Model](#leak-prioritization-model)
- [Cedar Authorization](#cedar-authorization)
- [API Reference](#api-reference)
- [Data and Photo Security](#data-and-photo-security)
- [Local Development](#local-development)
- [Testing](#testing)
- [AWS Infrastructure and Deployment](#aws-infrastructure-and-deployment)
- [Project Structure](#project-structure)
- [Current Limitations](#current-limitations)
- [Roadmap](#roadmap)
- [Links and Resources](#links-and-resources)

---

## The Problem

Municipal water distribution networks experience substantial losses through unaddressed distribution leaks, valve failures, and aging infrastructure. However, the operational challenge extends beyond the pipe rupture itself:

- **Fragmented Citizen Reporting**: Leak reports arrive through disorganized phone lines, social posts, or informal complaints with imprecise location data.
- **Duplicate Triage Overhead**: A single visible leak on a major roadway generates dozens of independent complaints, overwhelming dispatch dispatchers with redundant records.
- **Subjective Prioritization**: Maintenance teams lack a structured heuristic model to rank high-loss commercial gushes or potable drinking water leaks over slow non-potable drips.
- **Unverified Ticket Closure**: Tickets in traditional municipal systems are often marked "Resolved" via a simple database status toggle with no verifiable physical proof.
- **Accountability Vacuum**: When a repair is inadequate or fails days later, residents have no transparent mechanism to dispute closure and force a formal reinspection.

BOOND provides a cloud-native, serverless foundation that unifies citizen reporting, geospatial deduplication, heuristic urgency scoring, evidence-backed closure, and policy-driven dispute workflows into an accountable lifecycle.

---

## What BOOND Does

### 1. Location-Aware Citizen Reporting
Residents report leaks through a mobile-optimized Spray Brutalism interface, capturing browser GPS coordinates (or tapping a Leaflet map), selecting flow severity (`drip`, `steady`, or `gush`), indicating drinking-water status, and attaching before-repair photos.

### 2. Geospatial Proximity Deduplication (Haversine 30m)
When a new report arrives, the backend evaluates all candidate open tickets within a **30-metre radius** using the Haversine distance formula:
- If a match is found within 30 metres, the report is **merged** into the existing ticket rather than creating a duplicate.
- The ticket's reporter counter increments, and if the new report observes a more severe flow (e.g. `gush` vs `steady`), the flow category is automatically upgraded.
- The priority score recalculates dynamically.

### 3. Heuristic Priority Queue
Every ticket receives an algorithmic **Priority Score** combining flow-rate leakage midpoints, drinking-water impact multipliers, and community report frequency. The queue ranks highest-impact incidents at the top so repair crews address major water loss first.

### 4. Cryptographic & Evidence-Oriented Ticket Closure
A municipal engineer cannot close an open ticket through a simple UI switch. Closure requires authenticating with the backend, uploading an **after-repair photograph** directly to private S3 via presigned URLs, and evaluating fine-grained **Cedar authorization policies**.

### 5. Citizen Dispute & Reopening Safeguard
If a repair fails or a leak continues spraying, residents can submit a dispute on the closed ticket. Under the Cedar policy engine, when a ticket accumulates **2 or more resident disputes**, the ticket is automatically reopened to `OPEN` status, resetting proof states and alerting engineering crews.

### 6. Fine-Grained Policy Authorization (Cedar)
Authorization decisions are evaluated using AWS's **Cedar policy language** via `cedarpy`. Policy rules govern who can close tickets, require photo proof attributes, and enforce fail-closed security guarantees independent of frontend UI state.

### 7. Transparent Demonstration Scenarios
To enable evaluation during testing and hackathon review without polluting real municipal networks, the system includes a 20-scenario curated demo view distributed across Delhi urban zones. All simulated incidents are explicitly tagged with `is_simulated: true` and clear disclaimers.

---

## Architecture

BOOND separates the client interface, API gateway, compute execution, operational database, evidence storage, and policy evaluation:

```text
 [ Residents / Citizens ]                  [ Municipal Engineers ]
            ?                                         ?
            ?? Report leak (GPS + Photo)              ?? Review ranked queue
            ?? Dispute closed ticket                  ?? Upload after-repair photo
                                                      ?? Request evidence-based closure
            ?                                         ?
            ???????????????????????????????????????????
                                 ?
                                 ?
                 [ Amazon API Gateway HTTP API v2 ]
                                 ?
                                 ?
                     [ AWS Lambda (Python 3.12) ]
                                 ?
       ?????????????????????????????????????????????????????
       ?                         ?                         ?
 [ Cedar Authorization ]   [ Haversine 30m ]       [ Heuristic Urgency ]
 (cedarpy engine)          (Deduplication)         (Priority Scoring)
       ?                         ?                         ?
       ?????????????????????????????????????????????????????
                                 ?
                   ?????????????????????????????
                   ?                           ?
        [ Amazon DynamoDB ]             [ Amazon S3 ]
        (BoondTicketsTable)             (BoondPhotosBucket)
        Partition key: id (String)      Private encrypted storage
        PAY_PER_REQUEST billing         Direct presigned uploads
                                        
        [ Amazon S3 (Dedicated Frontend) ]
        Public read REST hosting (HTTPS)
        Vanilla HTML, CSS, JS + Leaflet
```

### AWS Service Responsibilities

| Component | Service | Responsibility |
|---|---|---|
| **API Entry Point** | Amazon API Gateway (HTTP API v2) | Low-latency REST endpoints, CORS negotiation (`Access-Control-Allow-Origin: *`), route dispatching |
| **Serverless Compute** | AWS Lambda (Python 3.12, x86_64) | Proximity clustering, priority calculation, presigned S3 URL generation, Cedar authorization evaluation |
| **Operational Storage** | Amazon DynamoDB (`BoondTicketsTable`) | Low-latency NoSQL storage for ticket records, reporter counts, coordinates, and workflow state |
| **Evidence Storage** | Amazon S3 (`BoondPhotosBucket`) | Secure private bucket with AES-256 server-side encryption for before/after leak photographic evidence |
| **Policy Engine** | Cedar (`cedarpy`) | Sub-millisecond evaluation of fine-grained access policies (`boond.cedar`) |
| **Frontend Hosting** | Amazon S3 (`boond-frontend-351458007747`) | Dedicated S3 bucket serving static HTML, CSS, JS, and vector/photo assets over HTTPS |
| **Infrastructure as Code** | AWS SAM / CloudFormation | Declarative configuration of serverless resources via `template.yaml` |

---

## End-to-End Workflows

### Workflow A ? Report a Leak
1. A resident identifies a street leak, opens BOOND, and captures their current GPS location (or taps the Leaflet map).
2. The resident selects the flow category (`drip`, `steady`, or `gush`) and indicates whether drinking water is affected.
3. If an initial photograph is attached, the browser calls `POST /photo-url` (`kind: "before"`), receives a presigned S3 PUT URL (600s TTL), and uploads the image binary directly to S3.
4. The client submits `POST /reports` with coordinates, flow, drinking status, and photo key.
5. The Lambda backend queries existing `OPEN` tickets and calculates geographic distance using the Haversine formula.
6. If an open ticket exists within 30 metres, the report is **merged**; otherwise, a new ticket is generated.
7. Priority score is calculated, and DynamoDB is updated.
### Workflow B — Merge Duplicate Reports
1. When `POST /reports` executes, the backend computes the great-circle distance between the new report and all open incidents using the Haversine formula:
   ```text
   d = 2R · arcsin(√(sin²(Δφ/2) + cos(φ₁) · cos(φ₂) · sin²(Δλ/2)))
   ```
2. If distance `d <= 30` metres, the candidate qualifies for merging.
3. The existing ticket increments its `reporters` counter (`reporters += 1`).
4. If the new report observed a more severe flow rate (e.g. resident reports `gush` on a ticket previously tagged `drip`), the flow is upgraded.
5. The priority score is recalculated with the updated reporter multiplier and flow midpoint.

### Workflow C — Review and Prioritize Tickets
1. The municipal dashboard issues `GET /tickets`.
2. The backend scans DynamoDB, filters for `OPEN` tickets, and sorts by descending `priority_score`.
3. The backend generates temporary presigned GET URLs (3600s TTL) for all stored photo keys so engineers can preview photographic evidence securely without making the photo bucket public.
4. The frontend renders the priority queue, displaying urgency badges, estimated daily water loss, and map markers.

### Workflow D — Evidence-Based Ticket Closure
1. An engineer clicks **CLOSE TICKET** on an open ticket.
2. The interface opens an authorization modal requiring an after-repair documentary photo and an Engineer PIN (`8472` in prototype).
3. The photo is uploaded directly to private S3 via `POST /photo-url` (`kind: "after"`).
4. The browser issues `POST /tickets/{id}/close` with header `X-Boond-Pin` and body `{"after_photo_key": "..."}`.
5. Lambda validates the PIN, loads the Cedar policy (`boond.cedar`), and evaluates:
   - `principal == Boond::Role::"engineer"`
   - `action == Boond::Action::"close_ticket"`
   - `resource.has_after_photo == true`
6. If permitted, the ticket status changes to `CLOSED`, records `closed_at`, and links the after-repair photo.
7. If denied (e.g. missing photo proof or invalid PIN), status remains `OPEN`, a Cedar denial message is returned, and the UI triggers a visual rejection alert.

### Workflow E — Citizen Dispute & Reopening
1. If water continues spraying after a ticket has been marked closed, a resident clicks **STILL LEAKING? DISPUTE REPAIR**.
2. The browser issues `POST /tickets/{id}/dispute`.
3. The backend increments the ticket's `dispute_count`.
4. If the ticket is `CLOSED`, the backend evaluates Cedar action `Boond::Action::"reopen_ticket"`.
5. When `dispute_count >= 2`, Cedar allows reopening: ticket status flips back to `OPEN`, after-repair photo state is cleared, and the ticket is prioritized back into the active engineering queue.

---

## Technology Stack

| Layer | Technology | Version / Specification |
|---|---|---|
| **Frontend Framework** | Vanilla HTML5, CSS3, JavaScript (ES2022) | No build step required; native DOM APIs |
| **Visual Design** | Spray Brutalism System | High-contrast black borders, hard offset shadows, cream theme, tactile buttons |
| **Mapping Engine** | Leaflet.js | v1.9.4 with OpenStreetMap tile layer |
| **Backend Runtime** | Python | 3.12 (targeting AWS Lambda x86_64) |
| **Policy Engine** | Cedar (`cedarpy`) | >= 4.0.0 |
| **AWS SDK** | Boto3 / Botocore | >= 1.34.0 |
| **Unit Testing** | pytest | >= 8.0.0 (30 unit & integration tests) |
| **IaC / Deployment** | AWS SAM / CloudFormation | Template v2016-10-31 |
| **Package Bundling** | `build.py` | Standalone Python packaging with manylinux wheel targeting |

---

## Leak Prioritization Model

BOOND employs an assumed daily leakage-rate heuristic to communicate relative urgency and guide maintenance prioritization.

### Assumed Flow Categories

| Flow Category | Assumed Daily Loss Range | Midpoint Value Used |
|---|---:|---:|
| **Drip** | 50 ? 200 Litres / Day | **125 L/d** |
| **Steady** | 500 ? 2,000 Litres / Day | **1,250 L/d** |
| **Gush** | 4,000 ? 15,000 Litres / Day | **9,500 L/d** |

### Priority Calculation Formula

$$	ext{Priority Score} = 	ext{Leakage Midpoint} 	imes 	ext{Drinking-Water Multiplier} 	imes 	ext{Reporter Multiplier}$$

Where:
- **Drinking-Water Multiplier**:
  - $1.5	imes$ if clean drinking water is being lost.
  - $1.0	imes$ if non-potable / raw water.
- **Reporter Multiplier**:
  $$	ext{Reporter Multiplier} = 1.0 + 0.25 	imes (	ext{Reporter Count} - 1)$$

### Worked Calculation Example
A high-pressure leak classified as a **gush** on a **drinking water** transmission line reported by **3 separate residents**:
- $	ext{Midpoint} = 9,500	ext{ L/d}$
- $	ext{Drinking Multiplier} = 1.5$
- $	ext{Reporter Multiplier} = 1.0 + 0.25 	imes (3 - 1) = 1.5$
- $	ext{Priority Score} = 9,500 	imes 1.5 	imes 1.5 = \mathbf{21,375.0}$

> **Methodological Disclaimer**: Flow categories are estimated visual observations, not meter measurements. Priority scores are heuristic triage models designed to rank relative operational urgency; they do not represent independently certified volumetric water savings.

---

## Cedar Authorization

BOOND delegates access control decisions to the **Cedar policy engine** (`cedarpy`), separating authorization policy from procedural business logic.

Policies are defined in [`backend/policies/boond.cedar`](file:///d:/BOOND/backend/policies/boond.cedar):

```cedar
// ==============================================================================
// BOOND ? Cedar Authorization Policies
// Namespace: Boond
// ==============================================================================

// Rule 1, 2, 3: Ticket Closure Policy
// Engineers are permitted to close a ticket only when after-repair photo proof is verified.
// Residents are not granted permission to close tickets (default deny / fail closed).
@id("engineer_close_ticket")
permit (
    principal == Boond::Role::"engineer",
    action == Boond::Action::"close_ticket",
    resource is Boond::Ticket
)
when {
    resource.has_after_photo == true
};

// Rule 4: Ticket Reopening Policy
// Residents are permitted to reopen a closed ticket when dispute count reaches at least 2.
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

### Authorization Rules Matrix

| Rule | Principal | Action | Condition | Cedar Decision | Effect |
|---|---|---|---|---|---|
| **Resident Close Attempt** | `Boond::Role::"resident"` | `close_ticket` | Any | **Deny** (Default Deny) | 403 Forbidden; ticket remains OPEN |
| **Engineer Close (No Photo)** | `Boond::Role::"engineer"` | `close_ticket` | `has_after_photo == false` | **Deny** | 403 Forbidden; closure blocked |
| **Engineer Close (With Photo)** | `Boond::Role::"engineer"` | `close_ticket` | `has_after_photo == true` | **Allow** | 200 OK; ticket marked CLOSED |
| **Dispute Under Threshold** | `Boond::Role::"resident"` | `reopen_ticket` | `dispute_count < 2` | **Deny** | 200 OK; dispute recorded, remains CLOSED |
| **Dispute At/Over Threshold** | `Boond::Role::"resident"` | `reopen_ticket` | `dispute_count >= 2` | **Allow** | 200 OK; ticket reopens to OPEN |
| **Engine Error / Bad Syntax** | Any | Any | Exception | **Deny** (Fail-Closed) | 500/403; execution halts safely |

### Prototype Authentication Notice
In this demonstration prototype, engineer credentials are provided via the `X-Boond-Pin` HTTP header matching the `ENGINEER_PIN` environment variable (default: `8472`). In a production implementation, this should be superseded by an Amazon Cognito User Pool and an API Gateway JWT Authorizer.

---

## API Reference

**Base API URL:**
```text
https://698gkx4o9a.execute-api.ap-south-1.amazonaws.com
```

All routes accept and return standard JSON with CORS enabled (`Access-Control-Allow-Origin: *`).

### 1. `GET /tickets`
Retrieves all open municipal tickets ranked in descending order of priority score.

**Example Request:**
```bash
curl "https://698gkx4o9a.execute-api.ap-south-1.amazonaws.com/tickets"
```

**Example Response (200 OK):**
```json
{
  "count": 1,
  "tickets": [
    {
      "id": "ticket-a17067e8",
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
        "reporter_multiplier": 1.5
      },
      "before_photo_url": "https://boond-photos.s3.amazonaws.com/...",
      "is_simulated": false
    }
  ],
  "disclaimer": "Estimated leakage ranges and priority scores are heuristic triage models based on reported flow rates and reporter counts. They do not constitute verified water volume saved."
}
```

---

### 2. `POST /reports`
Submits a citizen leak report. Automatically executes Haversine 30m deduplication against candidate open tickets.

**Example Request:**
```bash
curl -X POST "https://698gkx4o9a.execute-api.ap-south-1.amazonaws.com/reports"   -H "Content-Type: application/json"   -d '{
    "lat": 28.6139,
    "lng": 77.2090,
    "flow": "steady",
    "drinking": true,
    "photo_key": "photos/before/4a7f9b8c.jpg",
    "notes": "Burst fitting near community tap"
  }'
```

**Response (200 OK ? Created or Merged):**
```json
{
  "status": "created",
  "message": "Report logged as new ticket #ticket-a17067e8.",
  "ticket": { "id": "ticket-a17067e8", "priority_score": 1875.0, ... }
}
```

---

### 3. `POST /photo-url`
Generates a presigned S3 PUT URL for uploading evidence photos directly from the browser to the private S3 bucket.

**Example Request:**
```bash
curl -X POST "https://698gkx4o9a.execute-api.ap-south-1.amazonaws.com/photo-url"   -H "Content-Type: application/json"   -d '{"kind": "before"}'
```

**Response (200 OK):**
```json
{
  "upload_url": "https://boond-boondphotosbucket-lnzp32ryict4.s3.ap-south-1.amazonaws.com/photos/before/...?X-Amz-Signature=...",
  "key": "photos/before/f92a18c0.jpg",
  "kind": "before",
  "expires_in_seconds": 600
}
```

---

### 4. `POST /tickets/{id}/close`
Evaluates Cedar policy before transitioning a ticket from `OPEN` to `CLOSED`. Requires after-repair photo proof key and engineer authentication.

**Example Request:**
```bash
curl -X POST "https://698gkx4o9a.execute-api.ap-south-1.amazonaws.com/tickets/ticket-a17067e8/close"   -H "Content-Type: application/json"   -H "X-Boond-Pin: 8472"   -d '{"after_photo_key": "photos/after/e39b71f0.jpg"}'
```

**Response (200 OK ? Closed):**
```json
{
  "status": "closed",
  "message": "Ticket successfully closed following Cedar authorization.",
  "ticket": { "id": "ticket-a17067e8", "status": "CLOSED", "closed_at": "2026-10-12T00:00:00Z" },
  "authorization": {
    "allowed": true,
    "decision": "Allow",
    "reasons": ["engineer_close_ticket"],
    "errors": []
  }
}
```

**Response (403 Forbidden ? Denied by Cedar Policy):**
```json
{
  "error": "Forbidden",
  "message": "Ticket closure denied by Cedar policy: after-repair photo proof is mandatory.",
  "authorization": {
    "allowed": false,
    "decision": "Deny",
    "reasons": [],
    "errors": []
  }
}
```

---

### 5. `POST /tickets/{id}/dispute`
Increments dispute count on an incident. If the ticket is currently closed, evaluates Cedar policy to determine whether the 2-dispute threshold has been satisfied to trigger reopening.

**Example Request:**
```bash
curl -X POST "https://698gkx4o9a.execute-api.ap-south-1.amazonaws.com/tickets/ticket-a17067e8/dispute"   -H "Content-Type: application/json"
```

**Response (200 OK ? Reopened):**
```json
{
  "status": "reopened",
  "message": "Ticket reopened following resident dispute threshold.",
  "ticket": {
    "id": "ticket-a17067e8",
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

---

### 6. `POST /seed`
Engineer-only demonstration utility. Populates the database with 12 geographically dispersed simulated municipal leak tickets around demo coordinates.

**Headers:**
```text
X-Boond-Pin: <ENGINEER_PIN>
```

> **Safety Warning**: Calling `/seed` inserts simulated data into DynamoDB. Do not call this endpoint casually in production.

---

### Note on `GET /ledger`
A standalone `/ledger` backend route is not present in the deployed API. In the frontend (`frontend/app.js`), ledger impact metrics (total leaks addressed, estimated litres preserved, merged duplicates) are calculated dynamically on the client side using the active tickets response.

---

## Data and Photo Security

- **Private Photo Bucket**: The evidence bucket (`BoondPhotosBucket`) is completely private. Public read access, ACLs, and bucket policies are blocked via `PublicAccessBlockConfiguration`.
- **Presigned Upload URLs**: Image uploads use temporary, scoped presigned S3 URLs generated with a strict 10-minute expiry (600s), avoiding the need to expose AWS IAM credentials to the client.
- **Viewing URLs**: Photo viewing URLs are signed dynamically with a 1-hour expiration (3600s) during `GET /tickets` execution.
- **Isolated Frontend Hosting**: The public web frontend is hosted on a separate dedicated S3 bucket (`boond-frontend-351458007747`), preventing frontend public read access from affecting the private evidence bucket.
- **Fail-Closed Authorization**: All Cedar policy evaluations default to Deny if any parameter, entity structure, or runtime exception occurs.

---

## Local Development

### Prerequisites
- Python 3.12 (or virtualenv with `uv`)
- Node.js (for JavaScript syntax validation)
- Git
- AWS CLI & AWS SAM CLI (for deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/Ajayrathod04/BOOND.git
cd BOOND
```

### 2. Configure Python Virtual Environment
Using PowerShell on Windows:
```powershell
uv venv --python 3.12 .venv
.\.venv\Scripts\Activate.ps1
uv pip install -r backend/requirements.txt
```

*(Alternatively, standard Python tools can be used: `python -m venv .venv` and `.\.venv\Scripts\pip install -r backend/requirements.txt`)*

### 3. Run the Backend Test Suite
The backend test suite executes 100% locally with mocked AWS resources:
```powershell
.\.venv\Scripts\python.exe -m pytest .ackend	ests -q
```

### 4. Validate Frontend Syntax
```powershell
node --check frontend/app.js
node --check frontend/config.js
```

### 5. Run the Local Web Server
```powershell
python -m http.server 8000 --directory frontend
```
Navigate to `http://localhost:8000/` in any browser.

---

## Testing

The project maintains **30 unit and integration tests** passing with 100% test success:

| Test File | Tests | Coverage |
|---|---:|---|
| [`backend/tests/test_policy.py`](file:///d:/BOOND/backend/tests/test_policy.py) | **12** | Cedar policy rules: resident close denial, engineer no-photo denial, engineer photo permit, dispute threshold evaluation (<2 vs >=2), and fail-closed syntax/runtime error handling |
| [`backend/tests/test_app.py`](file:///d:/BOOND/backend/tests/test_app.py) | **18** | End-to-end API logic: route dispatch, Haversine 30m deduplication, flow upgrades on merge, presigned S3 upload generation, dispute reopening, seed handling, and CORS headers |
| **Total** | **30** | **All 30 tests passing locally in <1.0s** |

### Verified Test Output
```text
PS D:\BOOND> .\.venv\Scripts\python.exe -m pytest .ackend	ests -q
..............................                                           [100%]
30 passed in 0.63s
```

---

## AWS Infrastructure and Deployment

### AWS SAM Template (`template.yaml`)

The serverless infrastructure is defined declaratively using AWS SAM targeting Python 3.12:
- `BoondHttpApi`: AWS::Serverless::HttpApi with configured CORS origins and headers.
- `BoondBackendFunction`: AWS::Serverless::Function executing Python 3.12 on x86_64 architecture with least-privilege IAM policies.
- `BoondTicketsTable`: AWS::DynamoDB::Table with partition key `id` (String) and on-demand billing.
- `BoondPhotosBucket`: AWS::S3::Bucket with private access blocks and AES-256 server-side encryption.

### Packaging with `build.py`
To package Linux x86_64 compatible wheels without requiring Docker or WSL:
```powershell
python build.py --output dist/boond-backend.zip
```

### Building with AWS SAM
```powershell
sam build --template-file .	emplate.yaml
```

---

## Project Structure

```text
BOOND/
??? backend/
?   ??? __init__.py
?   ??? app.py                      # Lambda handler & API Gateway route dispatcher
?   ??? policy.py                   # Cedar authorization integration (cedarpy)
?   ??? requirements.txt            # Python dependencies (cedarpy, boto3, pytest)
?   ??? policies/
?   ?   ??? boond.cedar             # Cedar policy definitions (close & reopen rules)
?   ??? tests/
?       ??? __init__.py
?       ??? test_app.py             # 18 API route & workflow tests
?       ??? test_policy.py          # 12 Cedar authorization tests
??? frontend/
?   ??? index.html                  # Responsive Spray Brutalism UI & modals
?   ??? styles.css                  # Custom design system & micro-animations
?   ??? app.js                      # Leaflet map, queue rendering, Cedar auth modals
?   ??? config.js                   # API Gateway base URL endpoint configuration
?   ??? assets/                     # Photorealistic & SVG leak/repair illustrations
?       ??? active-leak-pipe.png
?       ??? demo-leaking-pipe.svg
?       ??? demo-repaired-pipe.svg
?       ??? municipal-water-infra.png
?       ??? repaired-pipe-joint.png
?       ??? water-conservation-infra.png
??? .gitignore                      # Git exclusion rules (.venv, .aws-sam, dist, caches)
??? build.py                        # Cross-platform Lambda zip packager
??? LICENSE                         # MIT License
??? README.md                       # Comprehensive architecture & project documentation
??? template.yaml                   # AWS SAM CloudFormation infrastructure template
```

---

## Current Limitations

1. **Heuristic Leakage Modeling**: Estimated litres/day and priority scores are heuristic triage models based on reported flow categories, not calibrated meter telemetry.
2. **Prototype Authentication**: The engineer authorization workflow utilizes an `X-Boond-Pin` header and session storage for demonstration purposes. Production deployments require Amazon Cognito JWT tokens.
3. **Simulated Incident Labeling**: Demonstration incidents in the curated demo view are simulated scenarios and must not be represented as actual municipal dispatch dispatches.
4. **Visual Evidence Caveat**: A photograph of a repaired pipe provides visual documentation but does not replace pressure telemetry or acoustic leak inspection.
5. **Direct S3 HTTPS Hosting**: The public prototype frontend is hosted directly via an S3 REST HTTPS endpoint rather than a CloudFront CDN distribution due to hackathon IAM permission boundaries.

---

## Roadmap

### 1. Identity & Security
- Integrate **Amazon Cognito User Pools** with separate `Citizen` and `MunicipalEngineer` groups.
- Enforce API Gateway **JWT Authorizers** with granular OAuth2 scopes.
- Restrict photo upload MIME types and enforce image byte-signature inspection via AWS Lambda.

### 2. Operational Reliability
- Implement **Amazon CloudWatch Alarms** and SNS alerts for critical high-priority drinking water gushes.
- Introduce dead-letter queues (DLQ) for asynchronous dispatch pipelines.
- Add automated end-to-end browser regression testing via Playwright/Puppeteer in CI/CD.

### 3. Municipal Engineering Integrations
- Integrate municipal GIS shapefiles for official ward boundaries and pipeline pressure zones.
- Support multi-crew dispatch assignment and job-ticket export (CSV/GeoJSON).
- Calibrate leakage rate heuristics using empirical municipal acoustic meter data.

---

## Links and Resources

### Project
- **GitHub Repository**: [https://github.com/Ajayrathod04/BOOND](https://github.com/Ajayrathod04/BOOND)
- **Live Frontend**: [https://boond-frontend-351458007747.s3.ap-south-1.amazonaws.com/index.html](https://boond-frontend-351458007747.s3.ap-south-1.amazonaws.com/index.html)
- **Live Tickets API**: [https://698gkx4o9a.execute-api.ap-south-1.amazonaws.com/tickets](https://698gkx4o9a.execute-api.ap-south-1.amazonaws.com/tickets)

### AWS & Technologies
- **AWS Serverless Application Model (SAM)**: [https://docs.aws.amazon.com/serverless-application-model/](https://docs.aws.amazon.com/serverless-application-model/)
- **Amazon API Gateway HTTP APIs**: [https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)
- **Amazon DynamoDB**: [https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- **Cedar Policy Language**: [https://docs.cedarpolicy.com/](https://docs.cedarpolicy.com/)
- **Leaflet.js**: [https://leafletjs.com/](https://leafletjs.com/)

### Hackathon
- **WeMakeDevs Environmental Hacks 2026**: [https://www.wemakedevs.org/aws/env](https://www.wemakedevs.org/aws/env)
- **Track**: Heat & Water Track

---

## Final Note

BOOND demonstrates how serverless cloud architecture, geospatial clustering, heuristic prioritization, photographic proof, and policy-as-code authorization can collaborate to make municipal water-leak maintenance transparent, efficient, and accountable.

**Every report deserves attention. Every repair deserves evidence. Every drop matters.**
