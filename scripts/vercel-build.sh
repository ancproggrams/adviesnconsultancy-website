
#!/bin/bash
set -e

echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
yarn install --immutable

# Generate Prisma Client
echo "🔄 Generating Prisma Client..."
npx prisma generate

# Build the application
echo "🏗️ Building Next.js application..."
yarn build

echo "✅ Vercel build completed successfully!"
