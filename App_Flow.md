# App Flow Document
## Food Rescue: Food Donation & Redistribution Management System

| Field | Value |
|---|---|
| Version | 1.0 (Draft) |
| Date | 18 October 2026 |

This document describes how each user moves through the application, including decisions, system actions and edge cases. Diagrams use Mermaid (renders on GitHub, VS Code and most Markdown viewers).

---

## 1. Global Flow (End-to-End)

```mermaid
flowchart LR
    A[Donor creates listing] --> B[Listing ACTIVE]
    B --> C[Nearby NGOs notified]
    C --> D[NGO claims]
    D --> E{Donor accepts?}
    E -- No --> B
    E -- Yes --> F{Pickup mode}
    F -- Self pickup --> H[NGO collects with OTP]
    F -- Volunteer --> G[Volunteer accepts task]
    G --> H2[Volunteer picks up with OTP]
    H2 --> I[Volunteer delivers with OTP]
    H --> J[Completed]
    I --> J
    J --> K[Ratings + Impact updated]
    B -. best-before passes .-> X[EXPIRED]
```

---

## 2. Entry and Onboarding Flow

```mermaid
flowchart TD
    L[Landing page] --> R{Has account?}
    R -- No --> S[Select role: Donor / NGO / Volunteer]
    S --> T[Enter details + password]
    T --> U[Verify email/phone OTP]
    U --> V{Needs verification?}
    V -- Donor individual / Volunteer --> W[Role dashboard]
    V -- NGO / Business donor --> X[Upload documents]
    X --> Y[Pending approval screen]
    Y --> Z{Admin decision}
    Z -- Approved --> W
    Z -- Rejected --> X2[Reason shown, re-upload]
    X2 --> Y
    R -- Yes --> LG[Login] --> W
    LG -. forgot password .-> FP[Email reset link] --> LG
```

**Rules**
- Login blocked until contact verification is done.
- Unverified NGOs can browse but see "Claim" disabled with a reason.
- 5 failed logins lock the account for 15 minutes.

---

## 3. Donor Flow

```mermaid
flowchart TD
    D1[Donor dashboard] --> D2[New listing]
    D2 --> D3[Fill form: food, qty, times, address, photos]
    D3 --> D4{Validation OK?}
    D4 -- No --> D3
    D4 -- Yes --> D5[Confirm safety declaration]
    D5 --> D6[Publish: status ACTIVE]
    D6 --> D7[Wait for claim]
    D7 --> D8{Claim received}
    D8 --> D9[Accept / Decline within 10 min]
    D9 -- Decline --> D7
    D9 -- Accept --> D10[Address revealed to claimant]
    D10 --> D11[Show pickup OTP/QR at handover]
    D11 --> D12[Pickup confirmed]
    D12 --> D13[Rate NGO / volunteer]
    D7 -- No claim before best-before --> D14[EXPIRED, option to relist]
    D6 -. edit/cancel while unclaimed .-> D6
```

**Screens:** Dashboard → Create Listing → My Listings → Listing Detail/Tracking → Rate → Impact.

**Edge cases**
- Edit locked after a claim exists; donor must cancel instead (with reason) which notifies the NGO.
- Donor ignores a claim: auto-accepted after the timeout.
- Donor cancels after volunteer assigned: volunteer and NGO notified immediately.

---

## 4. NGO Flow

```mermaid
flowchart TD
    N1[NGO dashboard] --> N2[Discover: map/list + filters]
    N2 --> N3[Open listing detail]
    N3 --> N4{Verified?}
    N4 -- No --> N5[Claim disabled, show verification status]
    N4 -- Yes --> N6[Choose Self pickup / Volunteer]
    N6 --> N7[Claim submitted]
    N7 --> N8{Listing still available?}
    N8 -- No --> N9[Already claimed message, back to Discover]
    N8 -- Yes --> N10[Await donor acceptance]
    N10 -- Declined --> N2
    N10 -- Accepted --> N11{Mode}
    N11 -- Self --> N12[Travel, show OTP/QR at pickup]
    N11 -- Volunteer --> N13[Track volunteer status]
    N13 --> N14[Show delivery OTP/QR to volunteer on arrival]
    N12 --> N15[Mark received]
    N14 --> N15
    N15 --> N16[Rate donor + volunteer]
```

**Edge cases**
- NGO may release a claim before pickup; listing returns to ACTIVE if time remains.
- No volunteer accepts within 15 minutes: prompt NGO to switch to self-pickup or widen radius.
- Quality issue on arrival: "Report a problem" with photo, flagged to admin.

---

## 5. Volunteer Flow

```mermaid
flowchart TD
    V1[Volunteer dashboard] --> V2[Toggle availability]
    V2 --> V3[Nearby open tasks]
    V3 --> V4[Task detail: pickup, drop, distance, window]
    V4 --> V5[Accept]
    V5 --> V6{First to accept?}
    V6 -- No --> V3
    V6 -- Yes --> V7[Navigate to pickup]
    V7 --> V8[Enter donor OTP]
    V8 -- Wrong, <5 tries --> V8
    V8 -- Correct --> V9[IN_TRANSIT, navigate to NGO]
    V9 --> V10[Enter NGO OTP]
    V10 --> V11[Delivered]
    V11 --> V12[Rate, view history]
    V7 -. cannot proceed .-> V13[Unassign with reason, task reopens]
```

---

## 6. Admin Flow

```mermaid
flowchart TD
    A1[Admin login] --> A2[Overview dashboard]
    A2 --> A3[Verification queue]
    A3 --> A4[View documents] --> A5{Decision}
    A5 -- Approve --> A6[User verified + notified]
    A5 -- Reject --> A7[Reason required + notified]
    A2 --> A8[Reports queue]
    A8 --> A9[Review evidence] --> A10{Action}
    A10 --> A11[Dismiss / Warn / Remove listing / Suspend / Ban]
    A2 --> A12[Analytics + CSV export]
    A2 --> A13[Settings: radius, meal weight, CO2 factor]
    A11 --> A14[Audit log entry]
    A6 --> A14
    A7 --> A14
```

---

## 7. Listing Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> ACTIVE: Publish
    ACTIVE --> CLAIMED: NGO claims
    CLAIMED --> ACTIVE: Declined / released
    CLAIMED --> PICKUP_ASSIGNED: Volunteer accepts
    CLAIMED --> IN_TRANSIT: Self pickup confirmed
    PICKUP_ASSIGNED --> IN_TRANSIT: Pickup OTP
    IN_TRANSIT --> DELIVERED: Delivery OTP
    DELIVERED --> COMPLETED: Receipt confirmed
    ACTIVE --> EXPIRED: Best-before passed
    CLAIMED --> EXPIRED: Best-before passed
    ACTIVE --> CANCELLED: Donor cancels
    CLAIMED --> CANCELLED: Donor cancels
    COMPLETED --> [*]
    EXPIRED --> [*]
    CANCELLED --> [*]
```

---

## 8. Notification Triggers

| Event | Recipient | Channels |
|---|---|---|
| New listing near NGO | NGOs in radius | In-app, email (optional push later) |
| Claim submitted | Donor | In-app, email |
| Claim accepted/declined | NGO | In-app, email |
| Task available | Volunteers in radius | In-app, SMS (optional) |
| Volunteer assigned | Donor, NGO | In-app, email |
| Pickup confirmed / Delivered | Donor, NGO | In-app |
| Expiring in 30 min, unclaimed/unpicked | Donor, NGO | In-app, SMS |
| Verification approved/rejected | User | In-app, email |
| Report outcome | Reporter, reported user | In-app, email |

---

## 9. Error and Exception Flows

| Situation | System Behaviour |
|---|---|
| Two NGOs claim simultaneously | One succeeds; other sees "Already claimed" and returns to feed |
| Best-before passes mid-flow | Flow halted, parties notified, status EXPIRED |
| Wrong OTP 5 times | Handover locked 10 min, admin visible in log |
| Token expired | Silent refresh; if it fails, redirect to login and return to prior page |
| Location permission denied | Prompt manual address/pincode entry |
| Offline / poor network | Show cached last list, retry banner, queue non-critical actions |
| Image upload fails | Retry, allow publishing with at least one photo uploaded |
| Suspended user | Login shows reason and appeal contact |

---

## 10. Route Map (Frontend)

| Route | Access |
|---|---|
| `/` , `/how-it-works`, `/impact` | Public |
| `/login`, `/register`, `/verify`, `/forgot-password` | Public |
| `/donor/dashboard`, `/donor/listings/new`, `/donor/listings/:id` | Donor |
| `/ngo/discover`, `/ngo/listings/:id`, `/ngo/claims/:id` | NGO |
| `/volunteer/tasks`, `/volunteer/tasks/:id` | Volunteer |
| `/notifications`, `/profile`, `/impact/me` | Authenticated |
| `/admin/*` (overview, verifications, users, listings, reports, analytics, settings, audit) | Admin |

Unauthorised access redirects to login; wrong-role access shows a 403 page.
