#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/packages/database
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed

echo "Starting API server..."
cd /app/apps/api
exec npx tsx src/index.ts
