# Al-Azzam Real Estate (العزام للعقارات)

## Overview

Full-stack bilingual (Arabic/English) real estate platform built with React + Vite, Express, and PostgreSQL.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui
- **Backend**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend state**: TanStack React Query
- **Forms**: react-hook-form + @hookform/resolvers/zod
- **Animations**: framer-motion

## Structure

```text
artifacts/
├── api-server/     # Express API server (backend)
└── al-azzam/       # React + Vite frontend (preview at /)
lib/
├── api-spec/       # OpenAPI spec + Orval codegen config
├── api-client-react/ # Generated React Query hooks
├── api-zod/        # Generated Zod schemas from OpenAPI
└── db/             # Drizzle ORM schema + DB connection
scripts/
└── src/seed.ts     # Database seed script
```

## Test Accounts

- Admin: admin1@azzam.com / 123456
- Admin: admin2@azzam.com / 123456
- User: user@azzam.com / 123456

## Key Features

- Beautiful bilingual homepage with hero section
- Property listing with search + filters (type, status, price range)
- Property detail page with image gallery and booking form
- JWT authentication with admin/user roles
- Admin dashboard with full CRUD, stats, booking management
- Dark/light mode toggle
- Arabic RTL + English LTR support
- Mobile responsive

## Database Schema

- `users` - id, email, password (bcrypt), name, role (admin/user)
- `properties` - id, title/titleAr, description/descriptionAr, price, location/locationAr, city/cityAr, type, status, area, images (JSON array), timestamps
- `bookings` - id, name, phone, message, propertyId (FK), createdAt

## API Endpoints

All at `/api/`:
- `POST /auth/login` — JWT login
- `GET /auth/me` — get current user
- `GET /properties` — list with filters/pagination
- `GET /properties/:id` — single property
- `POST /properties` — create (admin)
- `PUT /properties/:id` — update (admin)
- `DELETE /properties/:id` — delete (admin)
- `GET /bookings` — all bookings (admin)
- `POST /bookings` — create booking (public)
- `GET /bookings/stats` — dashboard statistics (admin)
- `DELETE /bookings/:id` — delete booking (admin)

## Running Locally

```bash
pnpm install
pnpm --filter @workspace/db run push       # Create/sync DB schema
pnpm --filter @workspace/scripts run seed  # Seed with sample data
```

Workflows start automatically for both frontend and backend.
