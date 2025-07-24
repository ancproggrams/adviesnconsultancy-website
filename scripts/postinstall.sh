
#!/bin/bash
set -e

echo "🔄 Running Prisma postinstall tasks..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Type check
echo "🔍 Running TypeScript checks..."
npx tsc --noEmit --skipLibCheck

echo "✅ Postinstall completed successfully!"
