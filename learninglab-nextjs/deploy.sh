#!/bin/bash

# LearningLab Cloudflare Pages Deployment Script

echo "🏗️  Building Next.js application..."
npm run build

echo "📦 Building for Cloudflare Pages..."
npm run pages:build

echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy .vercel/output/static --project-name learninglab-nextjs --branch main --commit-dirty=true

echo "✨ Deployment complete!"
echo "🌐 Your app is available at: https://learninglab-nextjs.pages.dev"
