# TrailWise | Adventure Camping Platform Documentation

## 1. Project Overview
TrailWise is a high-fidelity, professional wilderness expedition and camp management platform built with Next.js 15. The application serves three distinct user identities: Platform Administrators, Professional Camp Organizers (Partners), and Explorers (Users). It provides a full-cycle marketplace for discovering, booking, and managing adventure camps.

---

## 2. Technical Stack
- **Framework**: Next.js 15 (App Router)
- **UI Components**: Shadcn UI (Radix Primitives)
- **Styling**: Tailwind CSS with a custom forest-green cinematic palette.
- **Icons**: Lucide React
- **Data Persistence**: Robust LocalStorage-based store (`store.ts`) for prototype state persistence.
- **AI Integration**: Genkit for dynamic itinerary generation.

---

## 3. User Roles & Access Control

### A. Super Admin (Staff)
The "Command Center" of the platform. Admins have global oversight:
- **Inventory Moderation**: Audit camp submissions, feature premium listings, or hide inactive ones.
- **Partner Verification**: Review organizer registration documents (Gov ID, Business Reg) before activating their accounts.
- **Financial Ledger**: Access a global bookings ledger with commission tracking (10% standard fee).
- **CMS Control**: Update global site content, FAQs, and legal policies.
- **Security Audit**: Receive real-time notifications for every password recovery attempt or account identification event.

### B. Camp Organizer (Partner)
The service providers of the platform:
- **Business Registry**: Professional onboarding with document staging (Identity & Safety certifications).
- **Inventory Management**: Create high-fidelity camp listings with multi-day itineraries, weather info, and batch pricing.
- **Booking Management**: Accept or decline explorer requests and manage group logistics.
- **Audit Tracking**: View real-time status of submitted camps (Approved, Pending, or Rejected with specific Admin feedback).

### C. Explorer (User)
The consumer base:
- **Cinematic Marketplace**: Browse approved camps with advanced filtering (Difficulty, Price, Rating).
- **Deep Detail View**: Access video trailers, geo-coordinates, technical equipment lists, and itinerary timelines.
- **Booking Flow**: A 3-step secure checkout (Review -> Guest Details -> Payment Selection).
- **Personal Dashboard**: Track upcoming trips, review history, and account settings.

---

## 4. Key Workflows & Logic

### I. Camp Listing & Approval Lifecycle
1. **Creation**: Organizer adds a camp via the `CampForm`.
2. **Audit Queue**: The camp is saved with a `pending_approval` status and is NOT visible in the marketplace.
3. **Admin Review**: Admins use the "Action Center" to perform a "Deep Audit."
4. **Outcome**:
   - **Approval**: Status changes to `approved`; camp goes live in the marketplace.
   - **Rejection**: Admin provides a reason (e.g., "Missing safety docs"); Organizer sees this reason in their dashboard for correction.

### II. Identity Verification (The Registry Protocol)
- Organizers must provide business details (Registration #, HQ Address, Pincode) and upload physical documents.
- Admin must manually "Activate" an Organizer account. Until activated, Organizers cannot log in or list camps.

### III. Security Recovery & Admin Oversight
- **Forgot Password**: Triggers an email reset simulation and dispatches a high-priority alert to the Admin containing the user's current password.
- **Forgot Email**: Users can search via mobile number. If identified, the Admin receives an alert detailing which account was retrieved.

### IV. Financial Logic
- **Pricing**: Dynamic calculation based on Adult/Child counts.
- **Commission**: Platform automatically calculates a 10% commission on all "Confirmed" bookings, visible in the Admin Reports.

---

## 5. UI/UX Design Language
- **Cinematic Auth**: A pixel-perfect centered card layout with bokeh background lighting for the entry portal.
- **High-Density Dashboards**: Compact typography used for Admin modules to maximize information visibility.
- **Responsive Core**: All layouts utilize a "Mobile-First" grid strategy, ensuring the platform is accessible on phones, tablets, and desktops.
- **Branding Flexibility**: Global identity supports both "TrailWise" and "Adventure Camping" themes via centralized constants.

---

## 6. Project Structure
- `src/app/page.tsx`: The main marketplace and routing hub.
- `src/components/auth/`: Contains the high-fidelity login and registration logic.
- `src/components/dashboard/`: Dedicated panels for Admin, Organizer, and User workflows.
- `src/components/marketplace/`: Camp cards, deep detail views, and checkout flows.
- `src/lib/store.ts`: The central engine managing users, camps, bookings, and notifications.
- `src/lib/types.ts`: TypeScript interfaces ensuring data integrity across the platform.
