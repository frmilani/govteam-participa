#!/bin/sh
set -e

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed!"
echo "🚀 Starting aplicação..."

# Start the Next.js app
exec npm start
