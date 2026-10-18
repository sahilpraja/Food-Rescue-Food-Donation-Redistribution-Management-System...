# Requirements Reference Document (RRD)
## Food Rescue: Food Donation & Redistribution Management System

| Field | Value |
|---|---|
| Version | 1.0 (Draft) |
| Date | 18 October 2026 |
| Purpose | Single numbered source of truth for functional requirements, non-functional requirements, business rules and acceptance criteria |

> Priority: **M** = Must, **S** = Should, **C** = Could. IDs are stable and referenced by the TRD, tests and Brain.md.

---

## 1. Roles and Permissions

| Capability | Donor | NGO | Volunteer | Admin |
|---|:--:|:--:|:--:|:--:|
| Create/edit/cancel listing | ✔ | | | ✔ (moderate) |
| View available listings | | ✔ | ✔ (tasks) | ✔ |
| Claim listing | | ✔ | | |
| Accept delivery task | | | ✔ | |
| Verify users | | | | ✔ |
| Rate counterpart | ✔ | ✔ | ✔ | |
| View platform analytics | | | | ✔ |

---

## 2. Functional Requirements

### 2.1 Authentication and Accounts (FR-AUTH)
| ID | Requirement | Pri |
|---|---|---|
| FR-AUTH-01 | Users register with name, email, phone, password and role | M |
| FR-AUTH-02 | Email and phone verified via OTP before first login | M |
| FR-AUTH-03 | Login with JWT access token and refresh token | M |
| FR-AUTH-04 | Password reset via emailed time-limited link | M |
| FR-AUTH-05 | Account lock after 5 failed attempts for 15 minutes | S |
| FR-AUTH-06 | Users can edit profile and address; deactivate account | M |

### 2.2 Verification (FR-VER)
| ID | Requirement | Pri |
|---|---|---|
| FR-VER-01 | NGOs upload registration certificate and ID proof | M |
| FR-VER-02 | Business donors upload FSSAI licence (where applicable) | S |
| FR-VER-03 | Admin approves/rejects with mandatory reason on rejection | M |
| FR-VER-04 | Unverified NGOs cannot claim listings | M |
| FR-VER-05 | Verified badge shown on profile | S |

### 2.3 Donation Listings (FR-LST)
| ID | Requirement | Pri |
|---|---|---|
| FR-LST-01 | Create listing: title, food category, veg/non-veg/vegan, quantity and unit, packaging, prepared at, best before, pickup window, address, coordinates, 1–5 photos, notes | M |
| FR-LST-02 | Best-before must be after prepared-at and in the future | M |
| FR-LST-03 | Pickup window must end before best-before time | M |
| FR-LST-04 | Listing statuses: DRAFT, ACTIVE, CLAIMED, PICKUP_ASSIGNED, IN_TRANSIT, DELIVERED, COMPLETED, EXPIRED, CANCELLED | M |
| FR-LST-05 | Donor may edit only while ACTIVE and unclaimed | M |
| FR-LST-06 | System auto-expires listings past best-before | M |
| FR-LST-07 | Donor can duplicate a previous listing as a template | S |
| FR-LST-08 | Allergen tags (nuts, dairy, gluten, etc.) | S |

### 2.4 Discovery (FR-DIS)
| ID | Requirement | Pri |
|---|---|---|
| FR-DIS-01 | NGOs see active listings within a configurable radius (default 10 km) | M |
| FR-DIS-02 | Filters: category, diet type, minimum quantity, expiry window | M |
| FR-DIS-03 | Sort by nearest, soonest expiry, newest | M |
| FR-DIS-04 | Map view and list view | M |
| FR-DIS-05 | Exact address hidden until claim is accepted; approximate area shown before | M |

### 2.5 Claim Workflow (FR-CLM)
| ID | Requirement | Pri |
|---|---|---|
| FR-CLM-01 | NGO claims an ACTIVE listing; operation is atomic so only one claim succeeds | M |
| FR-CLM-02 | Donor accepts or declines a claim within 10 minutes, else auto-accept (configurable) | M |
| FR-CLM-03 | NGO selects self-pickup or volunteer delivery | M |
| FR-CLM-04 | NGO may release a claim before pickup; listing returns to ACTIVE if time remains | S |
| FR-CLM-05 | Claimed quantity may be partial where donor allows splitting | C |

### 2.6 Pickup and Delivery (FR-DEL)
| ID | Requirement | Pri |
|---|---|---|
| FR-DEL-01 | Volunteer tasks visible within radius to verified volunteers | M |
| FR-DEL-02 | Volunteer accepts a task; first to accept wins | M |
| FR-DEL-03 | Pickup confirmed by donor-shown OTP/QR | M |
| FR-DEL-04 | Delivery confirmed by NGO-shown OTP/QR | M |
| FR-DEL-05 | Status timeline recorded with timestamps | M |
| FR-DEL-06 | Volunteer unassign flow with reason; task reopens | S |
| FR-DEL-07 | Optional live location of volunteer during transit | C |

### 2.7 Notifications (FR-NOT)
| ID | Requirement | Pri |
|---|---|---|
| FR-NOT-01 | In-app notification centre with read/unread state | M |
| FR-NOT-02 | Email for claim, assignment, delivery, verification outcomes | M |
| FR-NOT-03 | Notify nearby NGOs on new matching listing | M |
| FR-NOT-04 | Alert donor/NGO 30 min before expiry if unclaimed/unpicked | S |
| FR-NOT-05 | SMS for OTPs and urgent alerts | S |
| FR-NOT-06 | User notification preferences | C |

### 2.8 Ratings, Reports and Disputes (FR-RAT)
| ID | Requirement | Pri |
|---|---|---|
| FR-RAT-01 | After COMPLETED, parties rate 1–5 with optional comment | M |
| FR-RAT-02 | Any user can report a listing or user with a reason | M |
| FR-RAT-03 | Admin can resolve reports, warn, suspend or ban | M |

### 2.9 Admin and Analytics (FR-ADM)
| ID | Requirement | Pri |
|---|---|---|
| FR-ADM-01 | Verification queue with document preview | M |
| FR-ADM-02 | Listing moderation (remove/flag) | M |
| FR-ADM-03 | Dashboard: listings, claims, completion rate, meals, kg saved | M |
| FR-ADM-04 | Export reports as CSV | S |
| FR-ADM-05 | Audit log of admin actions | M |

### 2.10 Impact (FR-IMP)
| ID | Requirement | Pri |
|---|---|---|
| FR-IMP-01 | Compute kg/meals per completed donation from quantity and unit | M |
| FR-IMP-02 | Show per-user and platform impact totals | M |
| FR-IMP-03 | Downloadable donation certificate (PDF) | C |

---

## 3. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-PERF-01 | Performance | Listing search API p95 < 500 ms for 10k active listings |
| NFR-PERF-02 | Performance | Page load (LCP) < 2.5 s on 4G |
| NFR-AVL-01 | Availability | 99.5% monthly uptime target |
| NFR-SEC-01 | Security | Passwords hashed with BCrypt; HTTPS everywhere |
| NFR-SEC-02 | Security | Role-based access control enforced server-side on every endpoint |
| NFR-SEC-03 | Security | Protect against OWASP Top 10 (validation, CSRF strategy, XSS, SQLi) |
| NFR-SEC-04 | Security | Uploaded files type- and size-checked (max 5 MB each), virus-scanned where possible |
| NFR-PRV-01 | Privacy | Collect minimum personal data; consent captured; address shared only post-claim |
| NFR-PRV-02 | Privacy | Data deletion/export on request (DPDP Act alignment) |
| NFR-SCL-01 | Scalability | Stateless API, horizontally scalable |
| NFR-USB-01 | Usability | WCAG 2.1 AA, responsive from 360 px width |
| NFR-LOC-01 | Localisation | UI strings externalised for future Hindi support |
| NFR-OBS-01 | Observability | Structured logs, metrics, health endpoints, error tracking |
| NFR-TST-01 | Quality | ≥ 80% unit-test coverage on services; E2E tests for core flows |
| NFR-BKP-01 | Reliability | Daily DB backups, 14-day retention, tested restore |

---

## 4. Business Rules

| ID | Rule |
|---|---|
| BR-01 | Only verified NGOs may claim listings. |
| BR-02 | A listing can have at most one active claim at a time. |
| BR-03 | Listings automatically expire at best-before time. |
| BR-04 | Donors must acknowledge a food-safety declaration for every listing. |
| BR-05 | Pickup must occur within the donor's pickup window; late claims are auto-cancelled. |
| BR-06 | Users with an average rating below 2.0 (min. 5 ratings) are flagged for admin review. |
| BR-07 | Three confirmed unsafe-food reports lead to automatic donor suspension pending review. |
| BR-08 | Quantity-to-meals conversion default: 1 meal ≈ 350 g (configurable). |
| BR-09 | CO2 avoided estimate default: 2.5 kg CO2e per kg of food saved (configurable, labelled as an estimate). |

---

## 5. Acceptance Criteria (Samples)

**AC-LST-01 (Create listing)**
- Given a verified donor, when they submit a valid form, then a listing is created as ACTIVE and visible to nearby NGOs within 5 seconds.
- Given best-before earlier than prepared-at, then submission is rejected with a field-level error.

**AC-CLM-01 (Concurrent claims)**
- Given two NGOs claim the same listing simultaneously, then exactly one succeeds and the other receives "Already claimed".

**AC-DEL-01 (Handover)**
- Given a volunteer at the donor location, when they enter the correct pickup OTP, then status becomes IN_TRANSIT; an incorrect OTP leaves status unchanged and counts attempts (max 5).

**AC-EXP-01 (Expiry)**
- Given an unclaimed listing passes best-before, then within 1 minute status becomes EXPIRED and it disappears from discovery.

---

## 6. Traceability (Summary)

| PRD Feature | Requirements |
|---|---|
| Registration & verification | FR-AUTH-*, FR-VER-* |
| Donation listing | FR-LST-*, BR-02..05 |
| Discovery | FR-DIS-* |
| Claim and logistics | FR-CLM-*, FR-DEL-* |
| Notifications | FR-NOT-* |
| Trust and safety | FR-RAT-*, BR-06, BR-07 |
| Admin and impact | FR-ADM-*, FR-IMP-*, BR-08, BR-09 |
