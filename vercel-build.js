const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting Vercel build process...');

// Function to run commands
const runCommand = (command, cwd = '.') => {
  console.log(`Running: ${command} in ${path.resolve(cwd)}`);
  try {
    execSync(command, { stdio: 'inherit', cwd, env: { ...process.env, NODE_ENV: 'production' } });
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`, error);
    return false;
  }
};

// Function to ensure a package is installed globally
const ensureGlobalPackage = (packageName) => {
  console.log(`Ensuring ${packageName} is installed globally...`);
  try {
    execSync(`npm list -g ${packageName} || npm install -g ${packageName}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.warn(`Warning: Could not verify/install global ${packageName}. Will try to proceed anyway.`);
    return false;
  }
};

// Function to ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating directory: ${dirPath}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Main build function
const build = async () => {
  // Create necessary directories
  ensureDirectoryExists('server/dist');
  ensureDirectoryExists('server/dist/client');
  
  // Ensure Vite is installed globally
  ensureGlobalPackage('vite');
  
  // Install and build the client
  console.log('Building client...');
  if (!runCommand('npm install', 'server/client')) {
    process.exit(1);
  }
  
  // Install dev dependencies explicitly
  console.log('Installing dev dependencies...');
  if (!runCommand('npm install --no-save vite @vitejs/plugin-react', 'server/client')) {
    console.warn('Warning: Could not install Vite dependencies. Will try to proceed anyway.');
  }
  
  // Modify the build command to output to the correct directory
  if (!runCommand('npx vite build --outDir ../dist/client', 'server/client')) {
    process.exit(1);
  }

  // Install and build the server
  console.log('Building server...');
  if (!runCommand('npm install', 'server')) {
    process.exit(1);
  }
  
  if (!runCommand('npm run build:server', 'server')) {
    process.exit(1);
  }

  // Copy client build to the correct location if needed
  if (fs.existsSync('server/client/dist') && !fs.existsSync('server/dist/client')) {
    console.log('Copying client build to server/dist/client...');
    runCommand('cp -r server/client/dist/* server/dist/client/', '.');
  }

  console.log('Build completed successfully!');
};

// Run the build
build().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
