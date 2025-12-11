# API Dockerfile for Railway deployment
FROM node:22-slim AS base

# Install pnpm
RUN npm install -g pnpm@10.0.0

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy all package.json files
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# Generate Prisma client BEFORE building
# Create a temporary .env file for Prisma generation (DATABASE_URL will be set by Railway at runtime)
RUN echo "DATABASE_URL=postgresql://user:pass@localhost:5432/temp" > /app/.env

WORKDIR /app/packages/database
RUN pnpm db:generate

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# Expose port (Railway will set PORT env var)
EXPOSE 3001

# Start the API
CMD ["node", "dist/index.js"]
