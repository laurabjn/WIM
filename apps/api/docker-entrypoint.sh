#!/bin/sh
set -e

echo "PWD=$(pwd)"

echo "Generating Prisma client..."
npx prisma generate --schema=prisma/schema.prisma

echo "Testing PrismaClient..."
node -e 'const { PrismaClient } = require("@prisma/client"); new PrismaClient(); console.log("Prisma OK")'

echo "Starting Nest..."
npm run start:dev