# Setup Guide

This guide will walk you through setting up the Whats Up Addis application for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 24.0.0 or higher
- **pnpm** 9.0.0 or higher
- **PostgreSQL** 15.0 or higher
- **Git**

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd whats-up-addis
```

### 2. Install pnpm (if not already installed)

```bash
npm install -g pnpm@9
```

### 3. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for all packages in the monorepo.

### 4. Set Up PostgreSQL Database

#### Option 1: Local PostgreSQL

Install PostgreSQL on your system and create a database:

```bash
# On macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb whats_up_addis
```

#### Option 2: Docker

```bash
docker run --name whats-up-addis-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=whats_up_addis \
  -p 5432:5432 \
  -d postgres:15
```

### 5. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/whats_up_addis"

# API
API_PORT=3001
API_URL=http://localhost:3001
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Web Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Crawler
CRAWLER_SCHEDULE="0 */6 * * *"
CRAWLER_USER_AGENT="WhatsUpAddis/1.0"
```

**Important**: Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Set Up Database Schema

Generate Prisma client:

```bash
pnpm db:generate
```

Run database migrations:

```bash
pnpm db:migrate
```

When prompted, give your migration a name (e.g., "initial").

### 7. Seed the Database (Optional)

The seed script will create:

- Default categories
- An admin user (email: admin@whatsupaddis.com)
- Sample crawler sources

```bash
cd packages/database
pnpm db:seed
```

**Note**: You'll need to update the admin password hash in the seed file or set it manually.

### 8. Start Development Servers

Start all services:

```bash
pnpm dev
```

Or start them individually in separate terminals:

```bash
# Terminal 1 - Frontend
pnpm web:dev

# Terminal 2 - Backend API
pnpm api:dev

# Terminal 3 - Crawler
pnpm crawler:dev
```

### 9. Verify Installation

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health Check: http://localhost:3001/health

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Database Connection Issues

1. Verify PostgreSQL is running:

   ```bash
   psql -U postgres -c "SELECT version();"
   ```

2. Check your DATABASE_URL in `.env`

3. Ensure the database exists:
   ```bash
   psql -U postgres -l
   ```

### Prisma Client Generation Issues

If you encounter issues with Prisma client:

```bash
cd packages/database
rm -rf node_modules
pnpm install
pnpm db:generate
```

### Module Not Found Errors

Clear all node_modules and reinstall:

```bash
pnpm clean
pnpm install
```

## Next Steps

1. Read the [Architecture Document](./architecture.md)
2. Review the API endpoints in the README
3. Explore the codebase
4. Start building features!

## Development Tips

### Database Management

View and edit data with Prisma Studio:

```bash
pnpm db:studio
```

### Hot Reload

All services support hot reload during development. Changes to files will automatically restart the relevant service.

### Type Checking

Run type checks across all packages:

```bash
pnpm type-check
```

### Linting

Lint all packages:

```bash
pnpm lint
```

Format code:

```bash
pnpm format
```

## Production Build

To create production builds:

```bash
# Build all packages
pnpm build

# Or build individually
pnpm --filter @whats-up-addis/web build
pnpm --filter @whats-up-addis/api build
pnpm --filter @whats-up-addis/crawler build
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Documentation](https://expressjs.com/)
- [pnpm Documentation](https://pnpm.io/)
