# Resource Reservation System

This project is a full-stack resource booking application built with Next.js, Prisma, and PostgreSQL. It allows staff members to view available resources, reserve rooms or equipment, and manage reservations in one place without scheduling confusion or double-bookings.

## Deliverables

- GitHub Repository: Complete application source code and documentation
- Entity Relationship (ER) Diagram: Link to ER Diagram
- Demonstration Video: Link to 3–5 min Video

## What I built

I created a reservation dashboard where users can:

- Sign up and log in securely with password hashing and session cookies
- View available resources by category, operational status, and search keywords
- See visual availability on an interactive daily schedule timeline (Day, Evening, and Full-day views)
- Book meeting rooms, equipment, vehicles, and workspaces with strict conflict prevention
- See upcoming reservations and personal booking history
- Manage reservation records with soft cancellation to preserve audit trails
- Admin-only actions to add resources, edit details, toggle maintenance mode, delete decommissioned assets, and create member accounts

## Core features

- Role-based access with ADMIN and MEMBER users
- Resource management for categories like meeting rooms, equipment, vehicles, and workspaces
- Reservation conflict handling using transactional mathematical overlap validation (startA < endB && endA > startB) to eliminate double-booking and race conditions
- Operational safeguards: blocks reservations on resources under maintenance, prevents booking in the past, and validates attendee count against room capacity
- Safe resource deletion: prevents deleting resources that have active upcoming reservations
- PostgreSQL-backed persistence through Prisma with composite indexes for fast scheduling queries
- Session-based authentication using bcryptjs password hashing and secure httpOnly JWT cookies
- Responsive UI built with Next.js App Router, Tailwind CSS, and reusable components (modals, skeletons, empty states)

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS & Lucide Icons
- bcryptjs for password hashing
- jose for JWT authentication
- Zod for validation

## Project structure

- src/app - app pages, login/register pages, and REST API routes
- src/components - dashboard widgets, modals, timeline, and reusable UI elements
- src/components/ui - reusable UI primitives (Button, Input, Select, Badge, Modal, EmptyState, Skeleton)
- src/context - authentication and user session state management
- src/lib - Prisma singleton client and JWT auth helpers
- src/services - core business logic for reservations, conflict checks, and resources
- prisma/schema.prisma - PostgreSQL database schema
- prisma/seed.ts - sample users, facilities, and bookings seeder
- prisma/create-admin.ts - standalone script for admin account creation
- prisma/migrations - SQL migration history

## Setup and run

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the root of the project and add:

```bash
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/resource_reservation_db?schema=public"
JWT_SECRET="change-this-to-a-long-random-secret-key-min-32-chars"
```

If you are using a local PostgreSQL database, make sure it is running before starting the app.

### 3. Set up the database

Run Prisma migrations to create the tables and indexes:

```bash
npx prisma migrate dev
```

### 4. Seed the database with demo data

Populate the database with pre-configured meeting rooms, projectors, vehicles, users, and sample reservations:

```bash
npx prisma db seed
```

### 5. Create an admin user (Optional)

You can also generate additional admin accounts using the project script:

```bash
npm run create:admin
```

Default values used by the script are:

- Email: super.admin@org.com
- Password: Admin@Secure2026

You can also pass custom values:

```bash
npx tsx prisma/create-admin.ts "System Administrator" "admin@company.com" "StrongPassword123" "IT"
```

### 6. Run the app

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Default login credentials

After running the seed script, you can log in using any of the following accounts:

### Admin Account

- Email: sarah.admin@org.com
- Password: Admin@123
- Access: Full admin access (add/edit/delete resources, toggle maintenance, add members)

### Member Account

- Email: pasindu.dev@org.com
- Password: Member@123
- Access: Standard user access (view catalog, view schedule, book slots, cancel own bookings)

## Useful commands

```bash
npm run dev              # Starts development server with Turbopack
npm run build            # Builds the production Next.js application
npm run lint             # Runs ESLint code quality checks
npx prisma studio        # Opens web interface to inspect PostgreSQL data
npm run create:admin     # Generates an Admin account safely
```

## Notes

- The app expects PostgreSQL to be available through `DATABASE_URL`.
- The default `JWT_SECRET` is only a fallback; it is recommended to replace it with your own secure value.
- The dashboard is designed for internal resource and room booking management for an organization.
- Deleting a resource is guarded: if a resource has active future reservations, the system will prevent deletion to preserve scheduling integrity.

## Summary

This project is a complete internal booking system that demonstrates full-stack development with Next.js, Prisma, authentication, role-based access, and reservation workflows. It addresses the operational challenges of shared resource coordination and is ready to be run locally after setting up PostgreSQL and the environment variables.
