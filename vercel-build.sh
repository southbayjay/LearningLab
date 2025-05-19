#!/bin/bash

echo "Starting custom Vercel build process..."

# Set environment variables
export NODE_ENV=production

# Navigate to client directory
cd server/client

# Install dependencies
echo "Installing client dependencies..."
npm install

# Install Vite and React plugin explicitly
echo "Installing Vite and plugins..."
npm install --no-save vite @vitejs/plugin-react @heroicons/react

# Build the client application
echo "Building client application..."
npx vite build

# Create the output directory structure
echo "Creating output directory structure..."
mkdir -p ../../.vercel/output/static

# Copy the built files to the Vercel output directory
echo "Copying built files to Vercel output directory..."
cp -r dist/* ../../.vercel/output/static/

# Create config file for Vercel
echo "Creating Vercel config file..."
cat > ../../.vercel/output/config.json << EOF
{
  "version": 3,
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
EOF

# Create the functions directory
echo "Setting up API functions..."
mkdir -p ../../.vercel/output/functions

# Navigate back to root
cd ../..

# Copy API files to functions directory
cp -r api/* .vercel/output/functions/

# Create a simple API config file
cat > .vercel/output/functions/api/index.js << EOF
module.exports = (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
};
EOF

echo "Build process completed successfully!"
