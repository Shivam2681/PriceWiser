const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const nextCacheDir = path.join(process.cwd(), '.next');

try {
  fs.rmSync(nextCacheDir, { recursive: true, force: true });
  console.log('[dev] Cleared stale .next cache');
} catch (error) {
  console.warn('[dev] Could not clear .next cache:', error.message);
}

const nextBin = require.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev'], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
