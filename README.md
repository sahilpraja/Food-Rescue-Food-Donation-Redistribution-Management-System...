# 🍲 Food Rescue: Food Donation & Redistribution Management System

[![Java](https://img.shields.io/badge/Java-21-orange.svg?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.0-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple.svg?logo=vite)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A modern, full-stack, enterprise-grade food recovery platform designed to connect commercial food businesses (hotels, caterers, restaurants) with verified NGOs, shelters, and volunteer couriers to eliminate edible food waste and fight hunger in urban communities.

---

## 📌 Table of Contents

- [Overview & Mission](#-overview--mission)
- [System Architecture](#-system-architecture)
- [Key Features by Role](#-key-features-by-role)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Local Setup](#-installation--local-setup)
  - [1. Database Configuration (PostgreSQL)](#1-database-configuration-postgresql)
  - [2. Backend Setup (Spring Boot)](#2-backend-setup-spring-boot)
  - [3. Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
- [Seeded Demonstration Accounts](#-seeded-demonstration-accounts)
- [API Reference & Postman Guide](#-api-reference--postman-guide)
  - [Authentication & Registration](#authentication--registration)
  - [Surplus Food Listings](#surplus-food-listings)
  - [Claim & Delivery Logistics](#claim--delivery-logistics)
  - [Impact Analytics](#impact-analytics)
- [Business Rules & Environmental Impact Calculation](#-business-rules--environmental-impact-calculation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌍 Overview & Mission

Millions of tonnes of fresh, wholesome food prepared by banquet halls, hotel kitchens, and corporate dining facilities end up in municipal landfills every day, releasing greenhouse gases (primarily methane) while vulnerable communities face food insecurity.

**Food Rescue** solves this distribution disconnect with a real-time, hyperlocal logistics network featuring:
- **Immediate Listing Publication**: Donors list surplus batch food with shelf-life timers, dietary tags (`VEG`, `NON_VEG`, `VEGAN`), and storage conditions.
- **Fair-Share Claim Allocation**: Non-profit organizations (NGOs) claim food within a 10-minute accept window.
- **Two-Way Cryptographic Handover**: 6-digit OTP verification at donor pickup and shelter delivery to ensure chain-of-custody.
- **Quantified Environmental Accounting**: Real-time calculation of landfill diversion (kg) and greenhouse gas reduction ($2.5 \times \text{kg} = \text{CO}_2\text{e}$).

---

## 🏛 System Architecture

```
                      ┌────────────────────────────────────────┐
                      │          React 19 + Vite SPA           │
                      │     (Responsive Tailwind-Free CSS)     │
                      └──────────────────┬─────────────────────┘
                                         │  HTTPS / REST / JSON
                                         ▼
                      ┌────────────────────────────────────────┐
                      │       Spring Boot 3.3.4 REST API       │
                      │   - Spring Security 6 (JWT Filter)     │
                      │   - OpenAPI 3 / Swagger Documentation  │
                      │   - Scheduled Lifecycle Expiry Engine  │
                      └──────────────────┬─────────────────────┘
                                         │  Hibernate / JPA
                                         ▼
                      ┌────────────────────────────────────────┐
                      │          PostgreSQL Database           │
                      │   - Flyway Schema Migrations (V1)      │
                      │   - Indexed Coordinates & Statuses     │
                      └────────────────────────────────────────┘
```

---

## 🚀 Key Features by Role

### 👨‍🍳 Food Donors (Hotels, Banquets, Restaurants)
- **Surplus Food Publishing**: Create detailed listings specifying meal portions, packaging type, prepared timestamp, and best-before expiration.
- **Automated Expiry Safeguards**: Listings auto-expire when past consumption window to prevent unsafe distribution.
- **Claim Moderation**: Accept or reject shelter requests with real-time feedback.
- **Pickup Verification**: View the volunteer's secure pickup OTP before releasing food containers.

### 🏛 Accredited NGOs & Shelters
- **Hyperlocal Discovery**: Explore nearby available food within a configurable radius (e.g., 10 km) sorted by expiration urgency.
- **One-Click Claims**: Reserve food batches and select fulfillment mode (`SELF_PICKUP` or `VOLUNTEER_DELIVERY`).
- **Delivery Confirmation**: Generate and verify the final delivery OTP when receiving food.

### 🚴 Volunteer Couriers
- **Available Delivery Queue**: Browse unassigned NGO claims awaiting community transport.
- **Task Acceptance & Routing**: Claim delivery assignments with origin, destination, and turnaround guidelines.
- **Secure Dual OTP Verification**:
  1. Provide **Pickup OTP** to the Donor kitchen to authorize food release.
  2. Input **Delivery OTP** from the receiving NGO to complete task.

### 🛡 Platform Administrators
- **Organization Verification Queue**: Review and verify government registrations (FSSAI licenses for donors, DARPAN IDs for NGOs).
- **Incident & Safety Moderation**: Moderate dispute reports, handle safety compliance, and audit resolution logs.
- **Live System Audit Log**: Searchable trail of critical security events, status updates, and user modifications.

---

## 💻 Technology Stack

### Backend
- **Framework**: Spring Boot 3.3.4
- **Language**: Java 21 (LTS)
- **Security**: Spring Security 6, JJWT (HMAC-SHA512), BCrypt Password Hashing
- **Data Persistence**: Spring Data JPA, Hibernate 6
- **Database**: PostgreSQL 16+
- **Database Migrations**: Flyway Core
- **Documentation**: SpringDoc OpenAPI 3 (`/swagger-ui.html`)
- **Build Tool**: Apache Maven 3.9+

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8.3
- **Icons**: Lucide React
- **Maps**: Leaflet & OpenStreetMap (interactive coordinate pickers)
- **Styling**: Vanilla CSS Design System with CSS variables and responsive glassmorphism

---

## 📂 Project Directory Structure

```text
Food-Rescue/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/foodrescue/
│   │   │   │   ├── admin/          # Verifications queue, report moderation, audit logs
│   │   │   │   ├── auth/           # JWT auth, user registration, OTP verify
│   │   │   │   ├── claim/          # NGO food reservation lifecycle & status
│   │   │   │   ├── common/         # Security filters, exception handlers, DataInitializer
│   │   │   │   ├── delivery/       # Courier logistics & dual OTP verification
│   │   │   │   ├── impact/         # Platform & partner carbon & meal metrics
│   │   │   │   ├── listing/        # Surplus food catalog & expiry scheduling
│   │   │   │   ├── notification/   # In-app real-time alerts
│   │   │   │   ├── rating/         # Peer ratings & safety incident reporting
│   │   │   │   └── user/           # User entities, credentials & roles
│   │   │   └── resources/
│   │   │       ├── db/migration/   # Flyway V1 SQL DDL schema
│   │   │       └── application.properties
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI cards, badges, navbars & modals
│   │   ├── context/                # AppContext (JWT session state & sync engine)
│   │   ├── lib/                    # apiClient.js & storageService.js
│   │   ├── pages/
│   │   │   ├── admin/              # Admin dashboard, audit logs, verifications
│   │   │   ├── donor/              # Donor dashboard, new listing, edit listing
│   │   │   ├── ngo/                # Discover feed, claim modals, detail views
│   │   │   ├── volunteer/          # Courier task board & delivery execution
│   │   │   ├── AuthLoginPage.jsx   # Role-aware login
│   │   │   ├── AuthRegisterPage.jsx# Partner onboarding & document upload
│   │   │   ├── ImpactPage.jsx      # Public quantified sustainability dashboard
│   │   │   └── LandingPage.jsx     # Hero landing, live counters & features
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml              # Local PostgreSQL container service
├── PRD.md                          # Product Requirements Document
├── TRD.md                          # Technical Architecture Specification
└── README.md                       # Master Documentation
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:
- **JDK 21** or higher (`java -version`)
- **Apache Maven 3.8+** (`mvn -v`)
- **Node.js 18+** & **npm 9+** (`node -v`, `npm -v`)
- **PostgreSQL 14+** (running locally on port 5432 or via Docker)

---

## 🛠 Installation & Local Setup

### 1. Database Configuration (PostgreSQL)

Create a dedicated database named `foodrescue`:

```sql
CREATE DATABASE foodrescue;
```

Alternatively, launch PostgreSQL using Docker Compose:
```bash
docker-compose up -d postgres
```

Verify your credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/foodrescue
spring.datasource.username=postgres
spring.datasource.password=Sahil@1234
```

---

### 2. Backend Setup (Spring Boot)

1. Open your terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Build and compile the project:
   ```bash
   mvn clean compile
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
4. The backend will initialize Flyway schema migrations and seed realistic baseline data via `DataInitializer.java`.
   - **Base API**: `http://localhost:8080/api/v1`
   - **Interactive Swagger UI**: `http://localhost:8080/swagger-ui.html`

---

### 3. Frontend Setup (React + Vite)

1. Open a new terminal tab and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web application at:
   - **Local Web App**: `http://localhost:5173/`

---

## 👥 Seeded Demonstration Accounts

The platform comes pre-seeded with realistic partners, verified documentation, live food donations, and active delivery tasks:

| Role | Organization / User | Email Address | Password | Account Status |
|:---|:---|:---|:---|:---|
| **ADMIN** | Platform Administrator | `admin@foodrescue.org` | `admin123` | Verified |
| **DONOR** | Grand Hyatt Regency Banquets | `chef@grandhyattdelhi.com` | `password123` | Verified (FSSAI) |
| **DONOR** | Saffron Spice Gourmet Dining | `kitchen@saffronspice.com` | `password123` | Verified (FSSAI) |
| **DONOR** | The French Crust Boulangerie | `bakery@frenchcrust.com` | `password123` | Verified (FSSAI) |
| **DONOR** | Green Leaf Organics | `greenleaf@organics.in` | `password123` | Verified (FSSAI) |
| **NGO** | Asha Food Shelter & Care Trust | `director@ashatrust.org` | `password123` | Verified (DARPAN) |
| **NGO** | Robin Hood Community Relief | `coordinator@robinhooddelhi.org` | `password123` | Verified (DARPAN) |
| **NGO (Pending)** | Smile & Hope Youth Shelter | `contact@smilehope.org` | `password123` | Pending Admin Approval |
| **VOLUNTEER** | Rahul Sharma (Courier) | `rahul.courier@foodrescue.org` | `password123` | Verified |
| **VOLUNTEER** | Priya Singh (Volunteer) | `priya.volunteer@foodrescue.org` | `password123` | Verified |

---

## 📡 API Reference & Postman Guide

### Authentication & Registration

#### 1. Register a New Account (`POST /api/v1/auth/register`)
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Central Community Kitchen",
  "email": "kitchen@centraldelhi.org",
  "phone": "+91 98111 22334",
  "password": "SecurePassword123",
  "role": "DONOR",
  "city": "New Delhi",
  "addressLine": "14 Barakhamba Road, Connaught Place",
  "fssaiLicense": "FSSAI-10022011009988"
}
```

#### 2. User Login (`POST /api/v1/auth/login`)
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@foodrescue.org",
  "password": "admin123"
}
```

**Response (`200 OK`)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "name": "Platform Administrator",
  "email": "admin@foodrescue.org",
  "role": "ADMIN",
  "verified": true
}
```

---

### Surplus Food Listings

#### 1. Create a New Listing (`POST /api/v1/listings`)
*Requires `Authorization: Bearer <TOKEN>` with role `DONOR`*

```json
{
  "title": "50 Portions Slow-Cooked Dal Makhani & Jeera Rice",
  "category": "Cooked Meals",
  "dietType": "VEG",
  "quantity": 50,
  "unit": "portions",
  "weightKg": 20.0,
  "packaging": "Insulated food-grade stainless containers",
  "preparedAt": "2026-10-18T12:00:00Z",
  "bestBefore": "2026-10-18T16:00:00Z",
  "pickupFrom": "2026-10-18T12:30:00Z",
  "pickupTo": "2026-10-18T14:30:00Z",
  "addressLine": "Connaught Place, Central Delhi",
  "city": "New Delhi",
  "latitude": 28.6315,
  "longitude": 77.2167,
  "allergens": "Dairy, Gluten",
  "notes": "Maintained in heated warmers at >65°C."
}
```

#### 2. Get Active Food Listings (`GET /api/v1/listings`)
Returns unexpired, active surplus offerings with donor profiles and distance metadata.

---

### Claim & Delivery Logistics

- **Claim a Listing**: `POST /api/v1/listings/{id}/claims` (Mode: `SELF` or `VOLUNTEER`)
- **Donor Decides Claim**: `POST /api/v1/claims/{id}/decide` (Accept / Decline)
- **Courier Task Queue**: `GET /api/v1/tasks/nearby` (Browse open tasks)
- **Accept Task**: `POST /api/v1/tasks/{id}/accept` (Assign courier)
- **Confirm Pickup OTP**: `POST /api/v1/tasks/{id}/confirm-pickup` (`{"otp": "849201"}`)
- **Confirm Delivery OTP**: `POST /api/v1/tasks/{id}/confirm-delivery` (`{"otp": "392018"}`)

---

### Impact Analytics

- **Global Platform Impact**: `GET /api/v1/impact/platform`
- **Partner Personal Impact**: `GET /api/v1/impact/me`

---

## 📊 Business Rules & Environmental Impact Calculation

1. **Portion to Kilogram Conversion**:
   $$\text{Weight (kg)} = \text{Portions} \times 0.35\text{ kg (350g per plate standard)}$$
2. **CO₂e Avoidance Factor (BR-09)**:
   $$\text{CO}_2\text{e Avoided (kg)} = \text{Total Food Saved (kg)} \times 2.5$$
   *(Based on EPA Waste Reduction Model & IPCC methane decomposition avoidance factor)*
3. **Automated Listing Expiry (BR-03)**:
   A scheduled background thread checks active listings every 60 seconds. Any listing whose `bestBefore` timestamp has passed is automatically marked `EXPIRED` to prevent compromised consumption.
4. **OTP Security (BR-07)**:
   OTPs expire after 10 minutes, and maximum entry attempts are capped at 5 to prevent brute-force attacks.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

*Engineered with ❤️ to eliminate food waste and nourish urban communities.*
