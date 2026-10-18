# UI/UX Design Brief
## Food Rescue: Food Donation & Redistribution Management System

| Field | Value |
|---|---|
| Version | 1.0 (Draft) |
| Date | 18 October 2026 |
| Platforms | Responsive web (mobile-first), desktop admin |

---

## 1. Design Goals
1. **Speed under time pressure**: food is perishable, so key actions (list, claim, accept task) must take very few taps.
2. **Trust and safety**: verification badges, expiry countdowns and clear status make users confident.
3. **Warmth and dignity**: the product is about helping people; the tone is hopeful, never pitying.
4. **Clarity for mixed audiences**: restaurant staff, NGO workers and volunteers have varied digital comfort and devices, often low-end phones.

## 2. Users and Contexts
| User | Context | Design Implication |
|---|---|---|
| Donor | Busy kitchen, one hand free, end of service | Large inputs, camera-first photo upload, templates for repeat items |
| NGO | Office or on the move, scanning options | Map + list, strong filters, expiry-first sorting |
| Volunteer | Outdoors, bright sun, on a bike/car | High contrast, big buttons, minimal text, one-tap navigation |
| Admin | Desktop, queues of work | Dense tables, keyboard-friendly, bulk actions |

## 3. Brand Personality and Tone
Warm, trustworthy, energetic, community-driven. Voice: simple, encouraging, plain language ("Your meals found a home"). Avoid jargon; support Hindi later, so keep copy short.

## 4. Visual Direction

### 4.1 Colour Palette (suggested)
| Role | Colour | Use |
|---|---|---|
| Primary | Fresh green `#2E9E5B` | Primary actions, success, brand |
| Primary dark | `#1F7A44` | Hover/pressed, headers |
| Accent | Warm orange `#F28C28` | Urgency, highlights, CTAs on marketing |
| Warning | Amber `#F5B301` | Expiring soon |
| Danger | Red `#D64545` | Expired, errors, cancel |
| Info | Blue `#2F80ED` | Links, in-transit status |
| Neutral | Greys `#1F2937` to `#F3F4F6` | Text, surfaces |
| Background | Off-white `#FAFAF7` | Page background |

Contrast must meet WCAG 2.1 AA (4.5:1 for body text). Never rely on colour alone: pair status colours with icons and text.

### 4.2 Typography
- Primary: **Inter** or **Poppins** (headings), system fallback.
- Scale: 12 / 14 / 16 (body) / 20 / 24 / 32. Minimum body size 16 px on mobile.
- Support Devanagari fonts (Noto Sans Devanagari) for future Hindi UI.

### 4.3 Shape, Spacing, Elevation
- 8-pt spacing grid; 12 px card radius; soft shadows only on floating elements.
- Minimum touch target 44×44 px.
- Iconography: outline icon set (Lucide/Material), food-category icons.

### 4.4 Imagery and Illustration
Friendly flat illustrations for empty states and onboarding; real food photos from listings. Avoid distressing imagery.

## 5. Information Architecture

```
Public: Landing, How it works, Impact, Login/Register
Donor:  Dashboard, New Listing, My Listings, Listing Detail, Notifications, Impact, Profile
NGO:    Discover (Map/List), Listing Detail, My Claims, Claim Tracking, Notifications, Impact, Profile
Volunteer: Tasks (Nearby), My Tasks, Task Detail/Navigation, History, Profile
Admin:  Overview, Verifications, Users, Listings, Reports, Analytics, Settings, Audit Log
```

Navigation: bottom tab bar on mobile (3–5 items per role); left sidebar on desktop admin.

## 6. Key Screens and Requirements

### 6.1 Landing Page
Hero with clear value statement, dual CTAs ("Donate Food" / "Receive Food"), live impact counter (meals saved), how-it-works in 3 steps, trust strip (verified NGOs), role-specific sign-up.

### 6.2 Registration and Verification
Step-based sign-up: role → basic info → OTP → (NGO/business) document upload → pending approval screen with expected time and status.

### 6.3 Donor: Create Listing (most critical form)
- Single scrolling form with sticky "Publish" button; target completion under 2 minutes.
- Camera-first photo upload (up to 5), automatic compression.
- Quick-pick chips for category, diet, packaging; quantity stepper with unit selector.
- "Best before" uses quick presets (+2h, +4h, +6h) plus custom time.
- Pickup window selector; address pre-filled from profile with map pin adjust.
- Food-safety declaration checkbox with short plain-language text.
- "Use previous listing" template shortcut.

### 6.4 NGO: Discover
- Map/list toggle; list cards show photo, title, quantity, diet icon, distance, **expiry countdown**, donor verification badge.
- Filter sheet: radius, category, diet, quantity, expiry window.
- Urgency treatment: amber under 2 hours, red under 30 minutes.
- Pin clustering on the map; user location with manual override.

### 6.5 Listing Detail
Photo carousel, key facts block (prepared at, best before, allergens, packaging), approximate location until claim accepted, donor rating, prominent **Claim** CTA with pickup-mode choice (Self pickup / Request volunteer).

### 6.6 Tracking Screen (all parties)
Vertical timeline: Listed → Claimed → Volunteer assigned → Picked up → Delivered → Completed. Each step has timestamp and actor; shows OTP/QR card when handover is due; contact buttons (call) once confirmed.

### 6.7 Volunteer Task Screen
Large card: pickup and drop, distance, time window, weight. One-tap "Accept". After acceptance: step-by-step cards (Go to pickup → Enter OTP → Go to drop → Enter OTP) with "Open in Maps" deep link.

### 6.8 Notifications
Grouped by today/earlier, unread indicator, tapping deep-links to the relevant screen.

### 6.9 Impact Dashboard
Friendly stat cards (meals, kg, CO2e estimate with "estimate" label), simple charts over time, shareable summary image, certificate download (later release).

### 6.10 Admin Console
Overview KPIs, verification queue with side-by-side document viewer, moderation queue for reports, sortable/filterable tables, audit log. Desktop-first.

## 7. Component Library (Minimum)
Buttons (primary/secondary/destructive/ghost), inputs with inline validation, selects, chips, steppers, date-time picker, file/camera uploader, listing card, status badge, countdown timer, timeline, map marker and cluster, toast, modal/bottom-sheet, empty state, skeleton loader, rating stars, OTP input, data table, tabs, avatar with verified badge.

## 8. Status Colour and Label System
| Status | Colour | Label |
|---|---|---|
| Active | Green | Available |
| Claimed | Blue | Claimed |
| Pickup assigned | Blue | Volunteer assigned |
| In transit | Purple | On the way |
| Delivered/Completed | Dark green | Delivered |
| Expiring soon | Amber | Expires in Xh |
| Expired | Grey/Red | Expired |
| Cancelled | Grey | Cancelled |

## 9. Interaction and Feedback Principles
- Immediate feedback: optimistic updates, toasts, skeletons; never leave the user guessing.
- Destructive actions (cancel, release claim) require confirmation with consequence stated.
- Errors say what happened and how to fix it; field-level validation.
- Real-time: new matching listings appear with subtle animation and optional sound/vibration.
- Prevent mistakes: disabled states with explanation, e.g. "Your NGO is awaiting verification".

## 10. Accessibility
WCAG 2.1 AA; full keyboard navigation; visible focus; ARIA live regions for status changes; alt text on listing photos; respects reduced motion; text scalable to 200%; colour-blind-safe status pairing with icons.

## 11. Responsive and Performance Guidelines
Breakpoints: 360 / 768 / 1024 / 1280. Mobile-first. Lazy-load images and maps, compress uploads, target LCP < 2.5 s on 4G, usable on low-end Android devices. PWA install prompt for volunteers.

## 12. Localisation
English at launch; layouts allow 30–40% text expansion; Hindi ready via externalised strings; date/time in local timezone (IST), 12-hour display with AM/PM; units in kg/portions.

## 13. Content and Microcopy Examples
- Empty NGO feed: "No food nearby right now. We'll notify you the moment something is listed."
- Claim success: "Claimed! Show this code to the volunteer or donor at pickup."
- Expiring: "Expires in 45 min. Pick up soon."
- Safety declaration: "I confirm this food was prepared hygienically and is safe to eat until the time shown."

## 14. Design Deliverables and Process
1. Low-fidelity wireframes for all core flows.
2. Clickable prototype for Donor create-listing and NGO claim flows; usability test with 5+ users per role.
3. Design tokens (colour, type, spacing) handed off to React/Tailwind config.
4. Component library in Figma mapped 1:1 to React components.
5. Final hi-fi screens (mobile + desktop), light mode first; dark mode optional later.

## 15. Success Criteria for the Design
- 90% of test donors complete listing in under 2 minutes without help.
- 90% of NGO testers can find and claim a listing in under 1 minute.
- Zero critical accessibility violations in automated and manual audit.
- System Usability Scale (SUS) score ≥ 80.
