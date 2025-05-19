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

// Main build function
const build = async () => {
  // Install and build the client
  console.log('Building client...');
  if (!runCommand('npm install', 'server/client')) {
    process.exit(1);
  }
  
  if (!runCommand('npm run build', 'server/client')) {
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

  console.log('Build completed successfully!');
};

// Run the build
build().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
