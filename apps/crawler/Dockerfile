# Crawler Dockerfile for Railway deployment
FROM node:22-slim AS base

# Install pnpm
RUN npm install -g pnpm@10.0.0

# Install dependencies for Puppeteer
RUN apt-get update -y && \
    apt-get install -y \
    openssl \
    chromium \
    chromium-sandbox \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/crawler/package.json ./apps/crawler/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/crawler ./apps/crawler
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# Copy .env for dotenv-cli (will be overridden by Railway env vars)
COPY .env ./.env

# Generate Prisma client
WORKDIR /app/packages/database
RUN pnpm db:generate

# Build crawler
WORKDIR /app/apps/crawler
RUN pnpm build

# Start the crawler
CMD ["node", "dist/index.js"]
