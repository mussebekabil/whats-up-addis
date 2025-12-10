# API Dockerfile for Railway deployment
FROM node:22-slim AS base

# Install pnpm
RUN npm install -g pnpm@10.0.0

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# Generate Prisma client
WORKDIR /app/packages/database
RUN pnpm db:generate

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# Expose port
EXPOSE 3001

# Start the API
CMD ["pnpm", "start"]
