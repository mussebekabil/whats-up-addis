# Whats Up Addis - Architecture Design Document

## 1. Overview

**Whats Up Addis** is an event discovery and management platform for Addis Ababa, Ethiopia. The platform enables users to discover, create, update, and manage events happening in the city. The system includes an automated crawler service that collects events from various websites to keep the platform up-to-date.

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Monorepo                             │
│                         (pnpm)                               │
├──────────────────┬──────────────────┬──────────────────────┤
│                  │                  │                      │
│   Frontend       │   Backend API    │   Crawler Service   │
│   (Next.js)      │   (Node.js/TS)   │   (Node.js/TS)      │
│                  │                  │                      │
└────────┬─────────┴────────┬─────────┴──────────┬──────────┘
         │                  │                    │
         │                  └────────┬───────────┘
         │                           │
         │                  ┌────────▼─────────┐
         └─────────────────►│   PostgreSQL     │
                            │    Database      │
                            └──────────────────┘
```

### 2.2 Component Overview

#### Frontend (Next.js + React)
- Server-side rendering for optimal SEO
- User interface for browsing and managing events
- Authentication and user management
- Event creation, editing, and deletion forms
- Responsive design for mobile and desktop

#### Backend API (Node.js + TypeScript)
- RESTful API for event CRUD operations
- User authentication and authorization
- Event validation and business logic
- Integration with PostgreSQL database
- API documentation with OpenAPI/Swagger

#### Crawler Service (Node.js + TypeScript)
- Automated web scraping from multiple sources
- Event data extraction and normalization
- Duplicate detection and deduplication
- Scheduled crawling jobs
- Error handling and retry mechanisms

#### Database (PostgreSQL)
- Event storage with full-text search capabilities
- User management
- Event categories and tags
- Audit logs
- Crawler source tracking

## 3. Technology Stack

### 3.1 Monorepo Management
- **pnpm**: Workspace management and dependency handling
- **Turborepo** (optional): Build orchestration and caching

### 3.2 Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: React Context API / Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Fetch API / Axios
- **Date Handling**: date-fns

### 3.3 Backend API
- **Runtime**: Node.js 20+
- **Framework**: Express.js / Fastify
- **Language**: TypeScript
- **ORM**: Prisma / TypeORM
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI

### 3.4 Crawler Service
- **Scraping**: Puppeteer / Playwright / Cheerio
- **Scheduling**: node-cron / Bull Queue
- **HTTP Client**: Axios
- **HTML Parsing**: Cheerio
- **Data Validation**: Zod

### 3.5 Database
- **Database**: PostgreSQL 15+
- **Full-Text Search**: PostgreSQL native FTS
- **Migrations**: Prisma Migrate / TypeORM migrations

### 3.6 DevOps & Tools
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, React Testing Library
- **Type Checking**: TypeScript
- **Git Hooks**: Husky + lint-staged
- **Environment**: dotenv

## 4. Database Schema

### 4.1 Core Tables

#### Events
```sql
- id: UUID (PK)
- title: VARCHAR(255)
- description: TEXT
- location: VARCHAR(255)
- venue: VARCHAR(255)
- start_date: TIMESTAMP
- end_date: TIMESTAMP
- image_url: VARCHAR(500)
- price: DECIMAL(10, 2) (nullable, for paid events)
- source: VARCHAR(100) (manual, crawler)
- source_url: VARCHAR(500)
- category_id: UUID (FK)
- created_by: UUID (FK, nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- is_active: BOOLEAN
```

#### Users
```sql
- id: UUID (PK)
- email: VARCHAR(255) UNIQUE
- password_hash: VARCHAR(255)
- name: VARCHAR(255)
- role: ENUM (user, admin, moderator)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### Categories
```sql
- id: UUID (PK)
- name: VARCHAR(100)
- slug: VARCHAR(100) UNIQUE
- description: TEXT
- created_at: TIMESTAMP
```

#### Crawler_Sources
```sql
- id: UUID (PK)
- name: VARCHAR(255)
- base_url: VARCHAR(500)
- scraper_type: VARCHAR(50)
- is_active: BOOLEAN
- last_crawled_at: TIMESTAMP
- created_at: TIMESTAMP
```

#### Event_Tags
```sql
- id: UUID (PK)
- event_id: UUID (FK)
- tag: VARCHAR(100)
```

## 5. API Endpoints

### 5.1 Events
- `GET /api/events` - List events (with pagination, filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create new event (authenticated)
- `PUT /api/events/:id` - Update event (authenticated, owner/admin)
- `DELETE /api/events/:id` - Delete event (authenticated, owner/admin)
- `GET /api/events/search` - Search events

### 5.2 Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug/events` - Get events by category

### 5.3 Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### 5.4 Admin
- `GET /api/admin/crawler/sources` - List crawler sources
- `POST /api/admin/crawler/sources` - Add crawler source
- `POST /api/admin/crawler/run` - Trigger manual crawl

## 6. Monorepo Structure

```
whats-up-addis/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App router pages
│   │   │   ├── components/    # React components
│   │   │   ├── lib/           # Utilities
│   │   │   └── styles/        # Global styles
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api/                    # Backend API
│   │   ├── src/
│   │   │   ├── routes/        # API routes
│   │   │   ├── controllers/   # Route controllers
│   │   │   ├── services/      # Business logic
│   │   │   ├── models/        # Database models
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── utils/         # Utilities
│   │   │   └── index.ts       # Entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── crawler/                # Crawler service
│       ├── src/
│       │   ├── scrapers/      # Site-specific scrapers
│       │   ├── services/      # Crawling logic
│       │   ├── utils/         # Utilities
│       │   └── index.ts       # Entry point
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                 # Shared code
│   │   ├── src/
│   │   │   ├── types/         # TypeScript types
│   │   │   ├── schemas/       # Zod schemas
│   │   │   └── utils/         # Shared utilities
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── database/               # Database package
│       ├── prisma/
│       │   ├── schema.prisma  # Prisma schema
│       │   └── migrations/    # Database migrations
│       ├── src/
│       │   └── client.ts      # Prisma client
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   └── architecture.md         # This file
│
├── .github/
│   └── workflows/              # CI/CD pipelines
│
├── package.json                # Root package.json
├── pnpm-workspace.yaml        # pnpm workspace config
├── turbo.json                 # Turborepo config (optional)
├── .gitignore
├── .env.example
└── README.md
```

## 7. Key Features

### 7.1 Event Discovery
- Browse upcoming events in Addis Ababa
- Filter by date, category, location
- Full-text search
- Event details with images and descriptions

### 7.2 Event Management
- User registration and authentication
- Create and publish events
- Edit and delete own events
- Admin moderation capabilities

### 7.3 Automated Crawling
- Scheduled scraping from multiple sources
- Automatic event extraction and normalization
- Duplicate detection
- Source attribution

### 7.4 User Experience
- Responsive design
- Fast page loads with SSR
- SEO optimized
- Accessible UI

## 8. Security Considerations

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention via ORM
- XSS protection
- CORS configuration
- Rate limiting on API endpoints
- Input validation and sanitization
- Environment variable management

## 9. Scalability & Performance

- Database indexing on frequently queried fields
- Pagination for large datasets
- Caching strategy (Redis optional)
- CDN for static assets
- Connection pooling for database
- Horizontal scaling capability

## 10. Development Workflow

1. **Setup**: Clone repo, run `pnpm install`
2. **Database**: Run migrations with Prisma
3. **Development**: Run all services with `pnpm dev`
4. **Testing**: Unit and integration tests
5. **Deployment**: Separate deployments for frontend, backend, and crawler

## 11. Future Enhancements

- User event bookmarks/favorites
- Event recommendations
- Social sharing
- Email notifications
- Mobile app (React Native)
- Multiple language support (Amharic, English)
- Event analytics dashboard
- Integration with external calendars
- Payment integration for paid events
- Event comments and ratings

## 12. Success Metrics

- Number of events in database
- User registrations
- Event creation rate
- Crawler success rate
- Page load performance
- Search accuracy
- User engagement metrics

---

**Version**: 1.0
**Last Updated**: 2025-11-18
**Status**: Pending Approval
