# Whats Up Addis

Event discovery and management platform for Addis Ababa, Ethiopia.

## Overview

Whats Up Addis is a modern web application that enables users to discover, create, and manage events happening in Addis Ababa. The platform includes an automated crawler service that collects events from various websites to keep the platform up-to-date.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Node.js 22, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Crawler**: Node.js with Puppeteer for dynamic content scraping
- **Authentication**: JWT with bcrypt

## Project Structure

```
whats-up-addis/
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Express backend API
│   └── crawler/      # Event crawler service
├── packages/
│   ├── database/     # Prisma schema and database client
│   └── shared/       # Shared types, schemas, and utilities
└── docs/             # Documentation
```

## Prerequisites

- Node.js 22 or higher
- pnpm 9.0.0 or higher
- PostgreSQL 15 or higher

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials and other configuration:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/whats_up_addis"
API_PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Set Up Database

Generate Prisma client and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Optionally, seed the database with initial data:

```bash
cd packages/database
pnpm db:seed
```

### 4. Start Development Servers

Start all services in development mode:

```bash
pnpm dev
```

Or start services individually:

```bash
# Frontend only
pnpm web:dev

# Backend API only
pnpm api:dev

# Crawler only
pnpm crawler:dev
```

The services will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database Studio: http://localhost:5555 (run `pnpm db:studio`)

## Available Scripts

### Root Level

- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Type check all packages
- `pnpm clean` - Clean all node_modules and build artifacts

### Database

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with initial data

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Events

- `GET /api/events` - List events (with pagination and filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create new event (authenticated)
- `PUT /api/events/:id` - Update event (authenticated)
- `DELETE /api/events/:id` - Delete event (authenticated)
- `GET /api/events/search` - Search events

### Categories

- `GET /api/categories` - List all categories
- `GET /api/categories/:slug` - Get category by slug
- `GET /api/categories/:slug/events` - Get events by category

### Admin (requires admin role)

- `GET /api/admin/crawler/sources` - List crawler sources
- `POST /api/admin/crawler/sources` - Add crawler source
- `PUT /api/admin/crawler/sources/:id` - Update crawler source
- `DELETE /api/admin/crawler/sources/:id` - Delete crawler source
- `POST /api/admin/crawler/run` - Trigger manual crawl

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts with authentication
- **events** - Event listings with details
- **categories** - Event categories
- **event_tags** - Tags for events
- **crawler_sources** - Website sources for the crawler

See `packages/database/prisma/schema.prisma` for the complete schema.

## Crawler Service

The crawler service automatically scrapes events from configured websites. To add a new crawler source:

1. Create a new scraper class in `apps/crawler/src/scrapers/`
2. Extend the `BaseScraper` class
3. Implement the `scrape()` method
4. Add the source to the database via the admin API

The crawler runs on a schedule (default: every 6 hours) and can also be triggered manually via the admin API.

## Development

### Adding a New Package

```bash
# Create package directory
mkdir -p packages/my-package

# Create package.json
cd packages/my-package
pnpm init

# Install dependencies
pnpm add <dependency>
```

### Database Changes

After modifying the Prisma schema:

```bash
pnpm db:generate
pnpm db:migrate
```

### Type Safety

All packages use TypeScript with strict mode enabled. Shared types are available in `@whats-up-addis/shared`.

## Deployment

### Backend API

1. Build the application: `pnpm --filter @whats-up-addis/api build`
2. Set environment variables
3. Run migrations: `pnpm db:migrate:prod`
4. Start the server: `pnpm --filter @whats-up-addis/api start`

### Frontend

1. Build the application: `pnpm --filter @whats-up-addis/web build`
2. Set environment variables
3. Start the server: `pnpm --filter @whats-up-addis/web start`

### Crawler

1. Build the application: `pnpm --filter @whats-up-addis/crawler build`
2. Set environment variables
3. Start the service: `pnpm --filter @whats-up-addis/crawler start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
