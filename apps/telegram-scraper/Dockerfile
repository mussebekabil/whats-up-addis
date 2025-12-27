# Telegram Scraper Dockerfile for Railway deployment
FROM node:22-slim AS base

# Install pnpm
RUN npm install -g pnpm@10.0.0

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all package.json files
COPY apps/telegram-scraper/package.json ./apps/telegram-scraper/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/telegram-scraper ./apps/telegram-scraper
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# Generate Prisma client BEFORE running
# Create a temporary .env file for Prisma generation (DATABASE_URL will be set by Railway at runtime)
RUN echo "DATABASE_URL=postgresql://user:pass@localhost:5432/temp" > /app/.env

WORKDIR /app/packages/database
RUN pnpm db:generate

# We don't need to build since we'll use tsx to run TypeScript directly
# This avoids issues with monorepo package imports

# No port exposure needed - this is a background service that doesn't listen on a port

# Start the telegram scraper with tsx (TypeScript executor)
# Default to listening mode for real-time message processing
WORKDIR /app/apps/telegram-scraper
CMD ["npx", "tsx", "src/index.ts", "listen"]
