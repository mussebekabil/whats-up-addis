# Event Approval Feature

## Overview

This feature adds an event approval system where all user-submitted events default to PENDING status and require admin approval before appearing publicly.

## What Changed

### Database Schema

- Added `status` field to events table (PENDING, ACCEPTED, REJECTED)
- Default status is PENDING for new events
- Only ACCEPTED events show in public listings

### Backend (API)

- **New Admin Endpoints:**
  - `GET /admin/events?status=PENDING&page=1&limit=20` - List events with filters
  - `PATCH /admin/events/:id/status` - Update event status

- **Modified:**
  - Public event listings now only show ACCEPTED events

### Frontend (Web)

- **New Admin Page:** `/admin/events`
  - View all events in a table format
  - Filter by status (Pending/Accepted/Rejected)
  - Click rows to view full event details in a dialog
  - Accept, Reject, or Reset event status

## Running the Migration

When your database is ready, run:

```bash
cd packages/database
npm run db:migrate
```

Or if that doesn't work (dotenv issue), use:

```bash
cd packages/database
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/whats_up_addis"
npx prisma@6.1.0 migrate dev
```

The migration will:

1. Create the EventStatus enum (PENDING, ACCEPTED, REJECTED)
2. Add status column to events table with PENDING as default
3. Create an index on the status column

## Testing the Feature

1. **Start the database:**

   ```bash
   # However you normally start PostgreSQL
   ```

2. **Run the migration:**

   ```bash
   cd packages/database
   npm run db:migrate
   ```

3. **Start the API:**

   ```bash
   cd apps/api
   npm run dev
   ```

4. **Start the web app:**

   ```bash
   cd apps/web
   npm run dev
   ```

5. **Test the flow:**
   - Create a new event as a regular user (it will be PENDING)
   - The event won't appear in public listings
   - Login as an admin user
   - Navigate to `/admin/events`
   - You should see the pending event
   - Click the event row to view details
   - Click "Accept Event" to approve it
   - The event will now appear in public listings

## Admin Access

To access the admin panel:

1. Login with an admin account (user role must be ADMIN)
2. Navigate to `/admin/events`

If you need to make a user an admin, update the database directly:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin@example.com';
```

## Files Modified

### Backend

- `packages/database/prisma/schema.prisma` - Added status field and EventStatus enum
- `packages/database/prisma/migrations/20251220154352_add_event_status/migration.sql` - Migration file
- `apps/api/src/services/event.service.ts` - Filter public events by ACCEPTED status
- `apps/api/src/services/admin.service.ts` - Added getPendingEvents() and updateEventStatus()
- `apps/api/src/controllers/admin.controller.ts` - Added getEvents() and updateEventStatus()
- `apps/api/src/routes/admin.routes.ts` - Added admin event routes

### Frontend

- `apps/web/src/lib/api.ts` - Added patch() method
- `apps/web/src/lib/admin.ts` - New admin API helper functions
- `apps/web/src/app/admin/events/page.tsx` - New admin events management page
- `apps/web/src/components/EventDetailsDialog.tsx` - New dialog component

## Existing Events

After running the migration, all existing events will be set to PENDING by default. If you want to accept all existing events, run:

```sql
UPDATE events SET status = 'ACCEPTED' WHERE status = 'PENDING';
```

Or you can accept them individually through the admin panel.
