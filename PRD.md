# Product Requirements Document (PRD)
## Food Rescue: Food Donation & Redistribution Management System

| Field | Value |
|---|---|
| Version | 1.0 (Draft) |
| Date | 18 October 2026 |
| Stack | React (frontend), Spring Boot (backend) |
| Status | For review |

---

## 1. Overview

### 1.1 Problem
Surplus edible food from restaurants, caterers, hotels, event venues and households is regularly thrown away while NGOs and communities nearby go without. The gap is coordination: donors do not know who needs food, NGOs do not know what is available, and perishable food leaves a very small window for pickup.

### 1.2 Vision
A web platform that connects food donors with verified NGOs and volunteers in near real time, so surplus food is listed, claimed, picked up and delivered before it spoils, with full traceability and impact reporting.

### 1.3 Goals
1. Reduce time from "donation listed" to "pickup confirmed" to under 30 minutes on average.
2. Make donating a listing a sub-2-minute task.
3. Ensure food safety through mandatory freshness/expiry data and handover checks.
4. Give every stakeholder (donor, NGO, volunteer, admin) visibility into status and impact.

### 1.4 Non-Goals (v1)
- Online payments or monetary donations.
- Selling or discounting food (this is not a marketplace).
- Native mobile apps (responsive web/PWA only in v1).
- Cold-chain IoT sensor integration.

---

## 2. Target Users and Personas

| Persona | Description | Key Need |
|---|---|---|
| **Donor** | Restaurant, hotel, caterer, event organiser, bakery, individual | List surplus quickly, get pickup fast, receive proof of donation |
| **NGO / Receiver** | Shelters, orphanages, community kitchens, food banks | See nearby available food, claim it, track arrival |
| **Volunteer** | Individual who transports food | See nearby pickup tasks, accept, navigate, confirm delivery |
| **Admin** | Platform operator | Verify users, moderate listings, resolve disputes, view analytics |

---

## 3. Scope and Features

### 3.1 MVP (Release 1)
1. **Registration and authentication**: role-based sign-up (Donor, NGO, Volunteer), email/phone OTP verification, login, password reset.
2. **Verification**: NGO and business donor document upload, admin approval.
3. **Donation listing**: food type, quantity, unit, veg/non-veg, packaging, prepared time, best-before time, pickup window, address with map pin, photos, notes.
4. **Discovery**: NGOs see nearby active listings (radius filter, sort by expiry/distance), map and list views.
5. **Claim workflow**: NGO claims a listing; donor confirms; listing locks to prevent double claims.
6. **Pickup and delivery**: NGO either self-collects or requests a volunteer; volunteer accepts, picks up, delivers. Status tracking throughout.
7. **Handover confirmation**: OTP or QR code exchange at pickup and at delivery.
8. **Notifications**: in-app, email, and optional SMS for key events (new nearby listing, claim, pickup assigned, delivered, expiry soon).
9. **Ratings and feedback** after completed donations.
10. **Admin console**: user verification, listing moderation, reports, basic analytics.
11. **Impact dashboard**: meals served, kg saved, estimated CO2 avoided, per user and platform-wide.

### 3.2 Release 2 (Later)
- Recurring donations (daily surplus schedules for restaurants).
- Route batching for volunteers (multi-pickup).
- Tax-receipt / donation certificate PDFs.
- Multi-language UI (Hindi and regional languages).
- PWA offline support and push notifications.
- NGO demand posts ("we need 50 meals for tomorrow").

---

## 4. User Stories (Key)

**Donor**
- As a donor, I can create a listing with quantity, expiry and pickup window so NGOs know what is available and by when.
- As a donor, I can cancel or edit a listing before it is claimed.
- As a donor, I can see the status of each donation and download a donation summary.

**NGO**
- As an NGO, I can browse available food near me on a map and filter by type, quantity and expiry.
- As an NGO, I can claim a listing and choose self-pickup or volunteer pickup.
- As an NGO, I can confirm receipt and rate the donor.

**Volunteer**
- As a volunteer, I can see open pickup tasks within my radius and accept one.
- As a volunteer, I can verify pickup with an OTP and mark delivery complete.

**Admin**
- As an admin, I can approve or reject verification requests with a reason.
- As an admin, I can suspend users or remove unsafe listings and view an audit trail.

---

## 5. Success Metrics (KPIs)

| Metric | Target (first 6 months) |
|---|---|
| Listing claim rate | ≥ 70% of listings claimed before expiry |
| Median time-to-claim | ≤ 20 minutes |
| Completed pickups / claimed | ≥ 90% |
| Food wasted after claim (expired in transit) | < 3% |
| Monthly active donors / NGOs / volunteers | Tracked, growth ≥ 15% MoM |
| Average rating | ≥ 4.3 / 5 |
| Meals redistributed | Tracked and reported on dashboard |

---

## 6. Assumptions and Constraints
- Launch region: India (initially one or two cities); currency/units: kg, portions, litres.
- Maps and geocoding via a third-party provider (Google Maps or OpenStreetMap-based).
- Food safety is the donor's responsibility; the platform enforces data capture and disclaimers but does not certify food.
- Compliance awareness: FSSAI guidelines for surplus food and applicable Indian data protection law (DPDP Act, 2023).

## 7. Risks

| Risk | Mitigation |
|---|---|
| Unsafe or expired food being donated | Mandatory prepared/expiry time, photo, disclaimer, rating and report system, admin takedown |
| Low volunteer availability | Self-pickup option, radius expansion, reminders, volunteer recognition |
| Fake NGOs / donors | Document verification, admin approval, audit log |
| Listing expires before pickup | Expiry countdown, priority sorting, "expiring soon" alerts |
| Privacy of addresses | Share exact address only after claim confirmation |

## 8. Release Plan (indicative)

| Phase | Duration | Output |
|---|---|---|
| Discovery and design | 2 weeks | Finalised docs, wireframes |
| Core build (auth, listing, claim) | 4 weeks | Alpha |
| Logistics and notifications | 3 weeks | Beta |
| Admin, analytics, hardening | 2 weeks | Release candidate |
| Pilot in one city | 4 weeks | Feedback and v1.1 |

## 9. Open Questions
1. Will the platform operate its own volunteer fleet or rely only on community volunteers?
2. Is SMS budget available for OTP and alerts?
3. Which maps provider will be used (cost vs. coverage)?
4. Are donation certificates needed in v1 for CSR reporting?
