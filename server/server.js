const { spawn } = require('child_process');
const path = require('path');

const serverDir = __dirname;
const port = process.env.PORT || '8000';
const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

console.log('Starting DineMate backend...');
console.log(`Launching FastAPI app from ${serverDir}`);

const child = spawn(pythonCommand, ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', port], {
  cwd: serverDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    PYTHONUNBUFFERED: '1'
  }
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Backend stopped with signal ${signal}`);
    process.exit(1);
  }

  if (code !== 0) {
    console.error(`Backend exited with code ${code}`);
    process.exit(code || 1);
  }
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit(0);
});
