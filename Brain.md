# Brain.md
## Food Rescue: Project Memory and Working Rules

> This file is the single quick-reference "brain" for the project. Read it first before doing any work (human or AI). Keep it short, current and honest. Update it whenever a decision changes.

*Last updated: 18 October 2026*

---

## 1. What We Are Building
**Food Rescue** is a web platform that connects surplus-food donors (restaurants, caterers, hotels, households) with verified NGOs, using volunteers for transport, so edible food reaches people before it spoils.

- **Roles:** Donor, NGO, Volunteer, Admin
- **Core loop:** List → Claim → (Volunteer) Pickup → Deliver → Rate → Impact
- **Stack:** React (TypeScript) + Spring Boot 3 (Java 21) + PostgreSQL/PostGIS + Redis + S3-compatible storage

## 2. Source-of-Truth Documents
| File | Use it for |
|---|---|
| `PRD.md` | Why and what: goals, personas, scope, KPIs |
| `RRD.md` | Numbered requirements (FR/NFR/BR) and acceptance criteria |
| `TRD.md` | Architecture, data model, APIs, security, DevOps |
| `UI_UX_Design_Brief.md` | Look, feel, screens, accessibility |
| `App_Flow.md` | User journeys, state machines, edge cases, routes |

If documents disagree: **RRD > TRD > PRD > UI brief** for behaviour; raise the conflict and fix the docs.

## 3. Non-Negotiable Principles
1. **Food safety first.** Expiry data is mandatory; expired items never appear in discovery.
2. **Privacy by default.** Exact address and phone are revealed only after a claim is accepted.
3. **Server-side authority.** Every permission and state transition is validated on the backend, never trusted from the client.
4. **One active claim per listing**, enforced at DB level.
5. **Speed matters.** Creating a listing < 2 min; claiming < 1 min; design for low-end phones and weak networks.
6. **Accessible and plain-language** UI (WCAG 2.1 AA).
7. **Every state change is auditable** (`status_events`, `audit_logs`).

## 4. Domain Glossary
| Term | Meaning |
|---|---|
| Listing | A donation offer with quantity, expiry and pickup window |
| Claim | An NGO's request to receive a listing |
| Delivery task | A volunteer job to move food from donor to NGO |
| Handover OTP/QR | Code that proves pickup or delivery occurred |
| Best-before | Last time the food is safe to be eaten (hard deadline) |
| Verified | Admin-approved identity/organisation |
| Meal | Impact unit, default ≈ 350 g (configurable) |

## 5. State Cheat-Sheet
- **Listing:** DRAFT → ACTIVE → CLAIMED → PICKUP_ASSIGNED → IN_TRANSIT → DELIVERED → COMPLETED (exits: EXPIRED, CANCELLED; CLAIMED → ACTIVE on decline/release)
- **Claim:** PENDING → ACCEPTED | DECLINED | RELEASED | EXPIRED
- **Task:** OPEN → ASSIGNED → PICKED_UP → DELIVERED

## 6. Key Decisions (Decision Log)
| # | Date | Decision | Reason |
|---|---|---|---|
| D1 | 2026-10-18 | Modular monolith, not microservices | Small team, faster v1; split later if needed |
| D2 | 2026-10-18 | PostgreSQL + PostGIS for geo search | Reliable radius queries, one datastore |
| D3 | 2026-10-18 | JWT access (15 min) + rotating refresh tokens | Stateless API, safe sessions |
| D4 | 2026-10-18 | Responsive web / PWA first, no native apps in v1 | Cost and speed |
| D5 | 2026-10-18 | Donor claim-accept timeout 10 min, then auto-accept | Avoid food spoiling while waiting |
| D6 | 2026-10-18 | Handover via OTP/QR | Proof without extra hardware |

*Add new rows; never silently rewrite old ones.*

## 7. Open Questions
1. Own volunteer fleet vs community volunteers only?
2. SMS budget and DLT registration timeline?
3. Maps provider (OSM vs Google)?
4. Are donation certificates required in v1?
5. Pilot city selection?

## 8. Build Order (Suggested)
1. Project scaffolding, CI, Docker Compose, Flyway baseline
2. Auth + roles + OTP
3. Verification + admin queue
4. Listings + photo upload + geo discovery
5. Claim workflow with concurrency tests
6. Delivery tasks + OTP handover
7. Notifications (in-app → email → SMS) + WebSocket
8. Ratings, reports, moderation
9. Impact dashboard + analytics
10. Hardening: security, load tests, accessibility audit, pilot

## 9. Conventions
**Backend**
- Package by feature (`listing`, `claim`, …); layers `controller → service → repository`.
- DTOs ≠ entities; MapStruct for mapping; Bean Validation on inputs.
- Errors as RFC 7807 problem JSON; API versioned at `/api/v1`.
- Timestamps stored UTC (`timestamptz`); display in IST on the client.
- DB changes only through Flyway migrations.
- Tests: JUnit 5 + Testcontainers; no merging with failing tests.

**Frontend**
- TypeScript strict; feature-folder structure; TanStack Query for server state.
- Forms: React Hook Form + Zod; shared validation rules mirror backend.
- No hard-coded strings (use i18n keys); no secrets in the client.
- Role-based route guards; lazy-load routes and maps.

**Git**
- Branches: `feature/<id>-short-name`, `fix/...`; PRs require review and green CI.
- Commit style: `type(scope): message` (e.g., `feat(claim): atomic claim creation`).
- Reference requirement IDs (e.g., `FR-CLM-01`) in PRs and tests.

## 10. Definition of Done
- Meets acceptance criteria in RRD and references its IDs
- Unit + integration tests pass; coverage target met
- Authorisation and ownership checks verified
- Accessible (keyboard + screen reader sanity check) and responsive at 360 px
- Logging/metrics added where relevant; no secrets or PII in logs
- Docs and this Brain.md updated if behaviour or decisions changed

## 11. Configurable Defaults
| Setting | Default |
|---|---|
| Discovery radius | 10 km |
| Claim accept timeout | 10 min |
| Volunteer assignment wait before prompt | 15 min |
| Meal weight | 350 g |
| CO2e per kg saved | 2.5 kg (estimate, labelled) |
| OTP validity / attempts | 10 min / 5 tries |
| Max upload size | 5 MB per file, up to 5 photos per listing |
| Login lockout | 5 fails, 15 min |

## 12. Risks to Watch
Unsafe food handling, fake NGOs, low volunteer supply, geo-query performance, SMS delivery compliance (India DLT), duplicate claims, privacy leaks of addresses.

## 13. Working Instructions for AI Assistants
- Read this file and the relevant doc section before generating code.
- Do not invent requirements; cite RRD IDs or ask.
- Never expose exact address/phone before a claim is accepted.
- Never bypass server-side role or state-machine checks "for convenience".
- Prefer small, testable changes; include tests with every feature.
- When unsure, list assumptions explicitly and add them to Section 7.
- After completing work, propose updates to Decision Log or Open Questions if needed.

## 14. Status Tracker
| Area | Status |
|---|---|
| Documentation (PRD, RRD, TRD, UI brief, App Flow, Brain) | Drafted v1.0 |
| Design system & Tokens | Complete (UI UX brief, Fresh Green `#2E9E5B`, Inter/Outfit) |
| Frontend Application | Complete (Vite + React, Map, All Roles, Offline/Storage Engine) |
| Backend API & Architecture | Complete (Spring Boot 3.3, Java 21, Security, JWT, REST APIs, Flyway) |
| Pilot plan | In Progress |
