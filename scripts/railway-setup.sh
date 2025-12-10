#!/bin/bash

# Railway Setup Script for What's Up Addis
# This script helps set up Railway services and environment variables

set -e

echo "🚂 What's Up Addis - Railway Deployment Setup"
echo "=============================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI found"
fi

# Login to Railway
echo ""
echo "📝 Logging into Railway..."
railway login

# Initialize or link project
echo ""
echo "🔗 Link to Railway project"
echo "1. Create a new project"
echo "2. Link to existing project"
read -p "Choose option (1 or 2): " option

if [ "$option" = "1" ]; then
    railway init
elif [ "$option" = "2" ]; then
    railway link
else
    echo "❌ Invalid option"
    exit 1
fi

# Add PostgreSQL database
echo ""
echo "📊 Setting up PostgreSQL database..."
echo "Please add a PostgreSQL database in the Railway dashboard:"
echo "1. Go to your Railway project"
echo "2. Click '+ New' → 'Database' → 'PostgreSQL'"
echo "3. Wait for provisioning to complete"
read -p "Press Enter when database is ready..."

# Get database URL
echo ""
echo "📝 Please enter your PostgreSQL DATABASE_URL from Railway:"
read -p "DATABASE_URL: " DATABASE_URL

# Set up API service
echo ""
echo "🔧 Setting up API service..."
railway service create api

echo "Setting API environment variables..."
railway variables set DATABASE_URL="$DATABASE_URL" --service api
railway variables set API_PORT="3001" --service api

read -p "JWT_SECRET (or press Enter for default): " JWT_SECRET
JWT_SECRET=${JWT_SECRET:-"change-this-in-production-$(openssl rand -hex 32)"}
railway variables set JWT_SECRET="$JWT_SECRET" --service api
railway variables set JWT_EXPIRES_IN="7d" --service api

echo ""
echo "Cloudinary Configuration (for image uploads):"
read -p "CLOUDINARY_CLOUD_NAME (or press Enter to skip): " CLOUDINARY_CLOUD_NAME
if [ ! -z "$CLOUDINARY_CLOUD_NAME" ]; then
    railway variables set CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" --service api
    read -p "CLOUDINARY_API_KEY: " CLOUDINARY_API_KEY
    railway variables set CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY" --service api
    read -p "CLOUDINARY_API_SECRET: " CLOUDINARY_API_SECRET
    railway variables set CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET" --service api
fi

# Set up Crawler service
echo ""
echo "🕷️  Setting up Crawler service..."
railway service create crawler

echo "Setting Crawler environment variables..."
railway variables set DATABASE_URL="$DATABASE_URL" --service crawler
railway variables set CRAWLER_SCHEDULE="0 */6 * * *" --service crawler
railway variables set CRAWLER_USER_AGENT="WhatsUpAddis/1.0" --service crawler

# Deploy services
echo ""
echo "🚀 Ready to deploy!"
echo ""
echo "Deployment commands:"
echo "  - Deploy API:     railway up --service api"
echo "  - Deploy Crawler: railway up --service crawler"
echo ""
read -p "Deploy now? (y/n): " deploy_now

if [ "$deploy_now" = "y" ]; then
    echo ""
    echo "📦 Deploying API service..."
    railway up --service api

    echo ""
    echo "📦 Deploying Crawler service..."
    railway up --service crawler

    echo ""
    echo "🗄️  Running database migrations..."
    railway run --service api pnpm --filter @whats-up-addis/database db:migrate:prod

    echo ""
    echo "✅ Deployment complete!"
else
    echo ""
    echo "ℹ️  You can deploy later using:"
    echo "   railway up --service api"
    echo "   railway up --service crawler"
fi

echo ""
echo "🎉 Railway setup complete!"
echo ""
echo "Next steps:"
echo "1. Enable public networking for API service in Railway dashboard"
echo "2. Copy the public URL and update your frontend's NEXT_PUBLIC_API_URL"
echo "3. Monitor logs: railway logs --service api"
echo ""
echo "📚 For more info, see RAILWAY_DEPLOYMENT.md"
