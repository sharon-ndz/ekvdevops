#!/bin/bash

set -e

ZIP_NAME="backend-api.zip"
DEST_ZIP_PATH="../infra/lambda/$ZIP_NAME"

echo "📦 Cleaning old dist and ZIP..."
rm -rf dist "$DEST_ZIP_PATH" node_modules

echo "🛠️ Installing all dependencies for build..."
npm ci

echo "🛠️ Compiling TypeScript with NestJS..."
npm run build

echo "♻️ Removing devDependencies..."
npm prune --production

echo "📁 Creating optimized Lambda ZIP package..."
zip -r "$DEST_ZIP_PATH" dist node_modules package.json > /dev/null

echo "✅ Lambda package created at: $DEST_ZIP_PATH"
du -sh "$DEST_ZIP_PATH"
