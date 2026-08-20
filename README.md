# Majestic Hostel

A modern hostel management web app for Majestic Girls Hostel, built with React, Vite, Tailwind CSS, shadcn/ui, and Supabase. The platform combines a public-facing hostel website with role-based student and warden dashboards for bookings, billing, complaints, notices, visitor approval, and facility management.

## Overview

This project is designed to help a hostel operate efficiently from a single platform:

- Public-facing website for the hostel brand and services
- Student login and dashboard
- Warden login and dashboard
- Room booking and admissions workflow
- Fee tracking and voucher uploads
- Leave and clearance requests
- Visitor requests and complaint management
- Notices, CMS content, gallery, and room listings

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui component system
- Framer Motion
- React Router
- Supabase for authentication and database
- Vitest for testing

## Project Structure

```bash
src/
├── App.tsx
├── components/
│   ├── dashboard/
│   ├── ui/
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   └── Reveal.tsx
├── context/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── data/
│   └── hostelData.ts
├── hooks/
│   └── use-mobile.tsx
├── integrations/
│   └── supabase/
│       └── client.ts
├── lib/
│   └── utils.ts
├── pages/
│   ├── About.tsx
│   ├── Booking.tsx
│   ├── Contact.tsx
│   ├── Facilities.tsx
│   ├── Gallery.tsx
│   ├── Home.tsx
│   ├── Index.tsx
│   ├── NotFound.tsx
│   ├── ResetPassword.tsx
│   ├── Rooms.tsx
│   ├── Rules.tsx
│   ├── StudentDashboard.tsx
│   ├── StudentLogin.tsx
│   ├── WardenDashboard.tsx
│   └── WardenLogin.tsx
├── test/
│   └── example.test.ts
└── main.tsx
```

## Features

### Public website
- Hostel landing page with hero section and premium branding
- Rooms and facilities overview
- Gallery and hostel rules
- Booking and contact forms
- Student and warden access routes

### Student portal
- Secure student login
- Profile management
- Room booking / admission flow
- Complaint submission
- Visitor request submission
- Fee and voucher upload
- Leave application management
- Clearance requests
- Notices and announcements

### Warden portal
- Warden dashboard overview
- Student management and search
- Booking approval workflow
- Billing and fines management
- Payment voucher verification
- Visitor approval/rejection
- Complaint review
- Notice publishing
- Rules and room content management
- Staff management
- Reviews moderation
- CMS for gallery, hostel rules, and room listings

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun
- Supabase project

### Install dependencies

```bash
npm install
```

Or with Bun:

```bash
bun install
```

### Run locally

```bash
npm run dev
```

The app will be available at:

```bash
http://localhost:5173
```

## Available Scripts

```bash
npm run dev        # Start the development server
npm run build      # Production build
npm run preview    # Preview the production build
npm run lint       # Run ESLint checks
npm run test       # Run Vitest tests
npm run test:watch # Run tests in watch mode
```

## Supabase

This app uses Supabase for authentication and database features. The client is configured in:

- src/integrations/supabase/client.ts

The project also includes Supabase config and migration files under:

- supabase/config.toml
- supabase/migrations/
- supabase/functions/

If you are using your own Supabase project, update the configuration in the client file with your project URL and anon key.

## Environment Configuration

The current app has the Supabase credentials embedded in the client configuration for local development. For production use, it is recommended to move these values into environment variables and reference them securely.

Example:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then update the client setup to read from `import.meta.env`.

## Deployment

This project is set up for Vite deployment and also includes a `vercel.json` config, so it can be deployed to Vercel easily.

### Build for production

```bash
npm run build
```

## Notes

- The app uses role-based authentication to separate student and warden access.
- Dashboard behavior depends on Supabase tables such as profiles, complaints, notices, bookings, billing_records, leave_requests, visitor_requests, payment_vouchers, and staff.
- The project includes a custom visual identity with golden accents and a hostel-themed landing page.

