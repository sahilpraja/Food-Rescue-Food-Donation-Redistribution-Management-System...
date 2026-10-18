# Technical Requirements Document (TRD)
## Food Rescue: Food Donation & Redistribution Management System

| Field | Value |
|---|---|
| Version | 1.0 (Draft) |
| Date | 18 October 2026 |
| Frontend | React (JavaScript) |
| Backend | Spring Boot (Java 21, Spring Boot 3.x) |

---

## 1. Architecture Overview

A single-page React application talks to a stateless Spring Boot REST API over HTTPS. The API persists to PostgreSQL (with PostGIS for geo queries), uses Redis for caching and rate limiting, object storage for images/documents, and a scheduler for expiry and reminders. Real-time updates use WebSocket (STOMP) or Server-Sent Events.

```
[React SPA] --HTTPS/JSON--> [API Gateway / Nginx]
                                  |
                          [Spring Boot API]
              ______________|____|____________________
              |            |         |               |
        [PostgreSQL+     [Redis]  [Object Store]  [Notification
         PostGIS]                  (S3/MinIO)      providers: Email/SMS]
```

Start as a **modular monolith** (clear packages per domain) to keep v1 simple; modules can be split later.

## 2. Technology Stack

### 2.1 Frontend
| Concern | Choice |
|---|---|
| Framework | React 18+ with javaScript, Vite |
| Routing | React Router |
| Server state | TanStack Query |
| Client state | Zustand (or Redux Toolkit if team prefers) |
| Forms/validation | React Hook Form + Zod |
| UI | Tailwind CSS + a component library (shadcn/ui or MUI) |
| Maps | Leaflet + OpenStreetMap tiles, or Google Maps JS API |
| Real-time | STOMP over WebSocket (`@stomp/stompjs`) |
| i18n | react-i18next |
| Testing | Vitest, React Testing Library, Playwright (E2E) |

### 2.2 Backend
| Concern | Choice |
|---|---|
| Language/Runtime | Java 21, Spring Boot 3.x |
| Modules | Web, Data JPA, Security, Validation, WebSocket, Mail, Actuator, Scheduling |
| Auth | Spring Security, JWT (access 15 min, refresh 7 days, rotation) |
| DB | PostgreSQL 15+, PostGIS, Hibernate Spatial |
| Migrations | Flyway |
| Mapping | MapStruct |
| API docs | springdoc-openapi (Swagger UI) |
| Caching/limits | Redis (Bucket4j for rate limiting) |
| Files | S3-compatible storage (AWS S3 / MinIO) via pre-signed URLs |
| Jobs | Spring `@Scheduled` + ShedLock (multi-instance safe) |
| Testing | JUnit 5, Mockito, Testcontainers |

### 2.3 DevOps
Docker, Docker Compose (local), GitHub Actions CI/CD, deploy to cloud container service or Kubernetes, Nginx/ALB, Prometheus + Grafana, Sentry for errors, centralised logs.

---

## 3. Backend Package Structure

```
com.foodrescue
 ├─ common        (config, exceptions, security, utils, audit)
 ├─ auth          (register, login, otp, tokens)
 ├─ user          (profiles, roles, verification)
 ├─ listing       (donation listings, expiry job)
 ├─ claim         (claim workflow)
 ├─ delivery      (tasks, handover OTP, timeline)
 ├─ notification  (in-app, email, sms, websocket)
 ├─ rating        (ratings, reports)
 ├─ admin         (moderation, audit log)
 ├─ impact        (metrics, analytics)
 └─ storage       (file upload, pre-signed URLs)
```
Layering inside each module: `controller → service → repository`, with DTOs separate from entities.

---

## 4. Data Model (Core Entities)

| Entity | Key Fields |
|---|---|
| `users` | id, name, email, phone, password_hash, role, status, email_verified, phone_verified, created_at |
| `organizations` | id, user_id, org_name, org_type, registration_no, verification_status, verified_by, verified_at |
| `documents` | id, owner_id, doc_type, storage_key, status, reviewed_by, reject_reason |
| `addresses` | id, user_id, line1, city, state, pincode, location (geography Point) |
| `listings` | id, donor_id, title, category, diet_type, quantity, unit, packaging, prepared_at, best_before, pickup_from, pickup_to, address_id, location, status, allergens, notes, safety_ack |
| `listing_photos` | id, listing_id, storage_key |
| `claims` | id, listing_id, ngo_id, status (PENDING/ACCEPTED/DECLINED/RELEASED), pickup_mode (SELF/VOLUNTEER), created_at, decided_at |
| `delivery_tasks` | id, claim_id, volunteer_id, status, pickup_otp_hash, delivery_otp_hash, picked_at, delivered_at, otp_attempts |
| `status_events` | id, entity_type, entity_id, from_status, to_status, actor_id, at |
| `notifications` | id, user_id, type, payload (jsonb), read_at, created_at |
| `ratings` | id, listing_id, from_user, to_user, score, comment |
| `reports` | id, reporter_id, target_type, target_id, reason, status, resolved_by |
| `audit_logs` | id, actor_id, action, target, metadata (jsonb), at |
| `app_settings` | key, value (meal weight, CO2 factor, default radius) |

**Indexes:** GiST on `listings.location`; composite on `(status, best_before)`; unique partial index on `claims(listing_id)` where status in (PENDING, ACCEPTED) to enforce one active claim.

---

## 5. State Machines

**Listing:** `DRAFT → ACTIVE → CLAIMED → PICKUP_ASSIGNED → IN_TRANSIT → DELIVERED → COMPLETED`
Side exits: `ACTIVE/CLAIMED → EXPIRED`, `ACTIVE/CLAIMED → CANCELLED`, `CLAIMED → ACTIVE` (claim released or declined).

**Claim:** `PENDING → ACCEPTED | DECLINED | RELEASED | EXPIRED`

**Delivery task:** `OPEN → ASSIGNED → PICKED_UP → DELIVERED`, with `ASSIGNED → OPEN` on volunteer unassign.

Transitions are validated in a single service-level state-machine class; every transition writes a `status_events` row.

---

## 6. API Design

Base path `/api/v1`. JSON, ISO-8601 UTC timestamps, pagination via `page`/`size`, errors in RFC 7807 problem format.

### 6.1 Endpoints (Representative)

| Area | Method and Path | Description | Roles |
|---|---|---|---|
| Auth | `POST /auth/register` | Register | Public |
| | `POST /auth/verify-otp` | Verify email/phone | Public |
| | `POST /auth/login` | Login | Public |
| | `POST /auth/refresh` | Rotate tokens | Public |
| | `POST /auth/forgot-password`, `/reset-password` | Reset flow | Public |
| Users | `GET/PUT /users/me` | Profile | Any |
| | `POST /users/me/documents` | Upload doc metadata | NGO, Donor |
| Listings | `POST /listings` | Create | Donor |
| | `GET /listings/nearby?lat&lng&radiusKm&category&diet` | Discover | NGO |
| | `GET /listings/{id}` | Detail | Auth |
| | `PUT /listings/{id}` | Edit (if unclaimed) | Donor |
| | `POST /listings/{id}/cancel` | Cancel | Donor |
| | `GET /listings/mine` | Donor's listings | Donor |
| Claims | `POST /listings/{id}/claims` | Claim | NGO |
| | `POST /claims/{id}/accept` / `decline` | Decision | Donor |
| | `POST /claims/{id}/release` | Release | NGO |
| Delivery | `GET /tasks/nearby` | Open tasks | Volunteer |
| | `POST /tasks/{id}/accept` | Accept | Volunteer |
| | `POST /tasks/{id}/pickup` (OTP) | Confirm pickup | Volunteer |
| | `POST /tasks/{id}/deliver` (OTP) | Confirm delivery | Volunteer |
| Notifications | `GET /notifications`, `POST /notifications/{id}/read` | Inbox | Any |
| Ratings | `POST /ratings`, `POST /reports` | Feedback | Any |
| Files | `POST /files/presign` | Pre-signed upload URL | Auth |
| Impact | `GET /impact/me`, `GET /impact/platform` | Metrics | Any |
| Admin | `GET /admin/verifications`, `POST /admin/verifications/{id}/approve|reject` | Verification | Admin |
| | `GET /admin/reports`, `POST /admin/users/{id}/suspend` | Moderation | Admin |
| | `GET /admin/analytics` | Dashboard | Admin |

### 6.2 WebSocket Topics
- `/user/queue/notifications`, `/topic/listings/nearby/{geoCell}`, `/user/queue/task-updates`.

### 6.3 Geo Query (concept)
`ST_DWithin(location, ST_MakePoint(:lng,:lat)::geography, :radiusMeters)` filtered by `status='ACTIVE' AND best_before > now()`, ordered by distance or expiry.

---

## 7. Security Design

- Spring Security stateless filter chain; `@PreAuthorize` role checks on all controllers; ownership checks in services.
- JWT signed with RS256 (or HS256 with rotated secret in vault); refresh tokens stored hashed, revocable.
- BCrypt (cost ≥ 10). OTPs hashed, 6 digits, 10-minute expiry, attempt-limited.
- Rate limiting per IP and per user (login, OTP, listing creation).
- CORS restricted to known origins; secure headers (HSTS, CSP, X-Content-Type-Options).
- Bean Validation on all inputs; parameterised queries via JPA; output encoding on the frontend; no `dangerouslySetInnerHTML` with user content.
- File upload: MIME + extension allow-list, max 5 MB, pre-signed URLs, private bucket for documents, signed read URLs for admins.
- Secrets in environment/secret manager, never in the repository.
- Exact address/phone exposure gated by claim status in the DTO mapper.
- Audit logging of admin and security-sensitive actions.

## 8. Concurrency and Reliability

- Claim creation uses a DB transaction with the unique partial index (or `SELECT ... FOR UPDATE`) so only one active claim succeeds.
- Optimistic locking (`@Version`) on listings and tasks.
- Expiry job runs every minute (ShedLock) to mark expired listings, cancel stale claims, and fire pre-expiry alerts.
- Notification delivery via an outbox table + async worker with retries and backoff.
- Idempotency keys on create endpoints that may be retried by flaky mobile networks.

## 9. Frontend Technical Notes

```
src/
 ├─ app/           (providers, router, query client)
 ├─ features/      (auth, listings, claims, tasks, notifications, admin, impact)
 │    └─ each: api/, components/, hooks/, pages/, types/
 ├─ components/    (shared UI)
 ├─ lib/           (axios client, auth utils, geo utils, formatters)
 ├─ routes/        (route guards by role)
 └─ locales/       (en, hi)
```
- Axios interceptor attaches access token and silently refreshes on 401.
- Role-based route guards; lazy-loaded route chunks.
- Optimistic UI for notification read state; skeleton loaders; error boundaries.
- Map components lazy-loaded; geolocation permission handled with manual address fallback.
- Accessibility: semantic HTML, focus management, ARIA on dynamic status updates.

## 10. Environments and CI/CD

| Env | Purpose |
|---|---|
| Local | Docker Compose: Postgres+PostGIS, Redis, MinIO, MailHog |
| Dev | Auto-deploy on merge to `develop` |
| Staging | Release candidates, pilot data |
| Production | Tagged releases, manual approval |

Pipeline: lint → unit tests → build → Testcontainers integration tests → Docker image → deploy → smoke test. Flyway migrations run on startup in non-prod and via controlled job in prod.

## 11. Observability
Actuator health/readiness, Micrometer metrics (claims/min, expiry rate, API latency), structured JSON logs with request IDs, Sentry on both frontend and backend, alerts on error rate and job failures.

## 12. Testing Strategy
- Unit tests for services and state machine; slice tests for controllers and repositories.
- Integration tests with Testcontainers (Postgres+PostGIS, Redis).
- Contract tests from OpenAPI spec.
- E2E (Playwright): register → verify → list → claim → pickup → deliver → rate.
- Load test (k6) for nearby-search and concurrent claims.
- Security: dependency scanning, SAST, basic OWASP ZAP run before release.

## 13. Third-Party Integrations
| Service | Use | Notes |
|---|---|---|
| Maps/Geocoding | Address search, pins, distances | OSM/Nominatim or Google; cache results |
| Email | Transactional | SES/SendGrid/SMTP |
| SMS | OTP, urgent alerts | India DLT registration required |
| Object storage | Photos, documents | S3 / MinIO |

## 14. Technical Risks
| Risk | Mitigation |
|---|---|
| Geo-query performance | PostGIS GiST index, bounding-box prefilter, caching hot areas |
| SMS delivery in India (DLT) | Start early with registration; email fallback |
| Duplicate claims | DB-level unique constraint plus tests |
| Large images slow uploads | Client-side compression, size limits, CDN |
