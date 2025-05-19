const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting LearningLab in development mode...');

// Start the backend server
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    FORCE_COLOR: '1',
    NODE_ENV: 'development'
  }
});

// Start the frontend dev server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server/client'),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    FORCE_COLOR: '1',
    NODE_ENV: 'development'
  }
});

// Handle process termination
const handleExit = (signal) => {
  console.log(`\n${signal}: Shutting down...`);
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

// Log process exits
backend.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  if (code !== 0) {
    frontend.kill();
    process.exit(code);
  }
});

frontend.on('exit', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  if (code !== 0) {
    backend.kill();
    process.exit(code);
  }
});
