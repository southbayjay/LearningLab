// Custom build script for Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run the build
console.log('Building client application...');
execSync('npm run build', { stdio: 'inherit' });

// Ensure the dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not found after build');
  process.exit(1);
}

console.log('Client build completed successfully!');
