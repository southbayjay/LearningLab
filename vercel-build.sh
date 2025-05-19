#!/bin/bash

# ------------------------------
# Custom Vercel build script
# ------------------------------

set -e  # Exit immediately on error

echo "Starting custom Vercel build process..."

# 1. Build client -----------------------------------------------------------
cd server/client

# Install ALL dependencies (prod + dev). NODE_ENV must **not** be production
npm install --include=dev

# Ensure Vite/tooling present even if lock file was cached without dev deps
npm install --no-save vite @vitejs/plugin-react @heroicons/react

# Build client (outputs to dist/)
echo "Building client application with Vite..."
npx vite build

# 2. Prepare .vercel/output directory --------------------------------------
cd ../..  # back to repo root

OUTPUT_DIR=".vercel/output"
STATIC_DIR="$OUTPUT_DIR/static"
FUNCTIONS_DIR="$OUTPUT_DIR/functions"
API_FUNC_DIR="$FUNCTIONS_DIR/api"

mkdir -p "$STATIC_DIR" "$API_FUNC_DIR"

# Copy built static assets
cp -r server/client/dist/* "$STATIC_DIR/"

echo "Creating Build Output config..."
cat > "$OUTPUT_DIR/config.json" << EOF
{
  "version": 3,
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

# 3. Copy API (serverless) functions ---------------------------------------
cp -r api/* "$FUNCTIONS_DIR/"

# Minimal health-check function to confirm API routing works
cat > "$API_FUNC_DIR/index.js" << EOF
module.exports = (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
};
EOF

echo "Build process completed successfully!"
