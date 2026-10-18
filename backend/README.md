# Food Rescue: Spring Boot REST API Backend

## 1. Overview
The backend for **Food Rescue** is built on **Java 21** and **Spring Boot 3.3.4**, implementing all functional requirements, business rules (`BR-01` to `BR-09`), state machines, and REST endpoints documented in `TRD.md`, `RRD.md`, and `Brain.md`.

## 2. Architecture & Modules
```
com.foodrescue
 ├─ common
 │    ├─ config       (SecurityConfig, WebConfig, OpenApiConfig, DataInitializer)
 │    ├─ exception    (GlobalExceptionHandler with RFC 7807 Problem Detail format)
 │    ├─ security     (JwtTokenProvider, JwtAuthFilter, UserPrincipal)
 │    └─ audit        (AuditLog, AuditLogRepository)
 ├─ auth             (Registration, Bcrypt hashing, OTP verification, JWT access/refresh)
 ├─ user             (Profiles, verification status, contact details)
 ├─ listing          (Surplus offers, spatial radius search, auto-expiry scheduler)
 ├─ claim            (Atomic claims lock, 10-minute auto-accept timer, donor decisions)
 ├─ delivery         (Volunteer task assignments, 6-digit OTP verification with 5-attempt limit)
 ├─ notification     (In-app notifications inbox, read/unread states)
 ├─ rating           (Post-delivery counterparty ratings and incident reports)
 ├─ impact           (Meal redistribution totals, kg diverted, CO2e avoided)
 └─ admin            (Document verification queue, report moderation, audit logs)
```

## 3. Endpoints (`/api/v1`)
| Group | Method & Path | Description | Access |
|---|---|---|---|
| **Auth** | `POST /api/v1/auth/register` | Register new user | Public |
| | `POST /api/v1/auth/login` | Login to receive JWT token | Public |
| | `POST /api/v1/auth/verify-otp` | Verify contact OTP | Public |
| | `POST /api/v1/auth/refresh` | Rotate tokens | Public |
| **Users** | `GET /api/v1/users/me` | Current user profile | Auth |
| | `PUT /api/v1/users/me` | Update name / address / phone | Auth |
| **Listings** | `POST /api/v1/listings` | Create donation listing | Donor |
| | `GET /api/v1/listings/nearby` | Discover within radius (lat/lng/radius) | Public/NGO |
| | `GET /api/v1/listings/{id}` | Listing detail (masked address prior to claim) | Auth |
| | `POST /api/v1/listings/{id}/cancel` | Cancel listing before fulfillment | Donor |
| | `GET /api/v1/listings/mine` | Donor's past and active listings | Donor |
| **Claims** | `POST /api/v1/listings/{id}/claims` | Claim listing (Atomic lock) | Verified NGO |
| | `POST /api/v1/claims/{id}/accept` | Accept claim and unlock donor address | Donor |
| | `POST /api/v1/claims/{id}/decline` | Decline claim (reverts to ACTIVE) | Donor |
| **Delivery** | `GET /api/v1/tasks/nearby` | Open tasks for courier pickup | Volunteer |
| | `POST /api/v1/tasks/{id}/accept` | Accept courier task | Volunteer |
| | `POST /api/v1/tasks/{id}/pickup` | Confirm pickup via donor OTP | Volunteer |
| | `POST /api/v1/tasks/{id}/deliver` | Confirm delivery via NGO OTP | Volunteer |
| **Notifications** | `GET /api/v1/notifications` | User notification inbox | Auth |
| | `POST /api/v1/notifications/{id}/read` | Mark notification as read | Auth |
| **Feedback** | `POST /api/v1/ratings` | Rate counterpart (1-5 stars) | Auth |
| | `POST /api/v1/reports` | File incident/safety report | Auth |
| **Impact** | `GET /api/v1/impact/platform` | Global platform impact totals | Public |
| | `GET /api/v1/impact/me` | Personal impact metrics | Auth |
| **Admin** | `GET /api/v1/admin/verifications` | NGO/business verification queue | Admin |
| | `POST /api/v1/admin/verifications/{id}/approve` | Approve verification | Admin |
| | `POST /api/v1/admin/verifications/{id}/reject` | Reject with mandatory reason | Admin |
| | `GET /api/v1/admin/reports` | Incident moderation queue | Admin |
| | `POST /api/v1/admin/reports/{id}/resolve` | Resolve report with action | Admin |
| | `GET /api/v1/admin/audit` | Searchable system audit trail | Admin |

## 4. How to Run
```bash
# In the backend directory:
mvn spring-boot:run
```
- **API Base URL**: `http://localhost:8080/api/v1`
- **Swagger UI Interactive Documentation**: `http://localhost:8080/swagger-ui.html`
- **H2 In-Memory Console**: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:foodrescuedb`)
