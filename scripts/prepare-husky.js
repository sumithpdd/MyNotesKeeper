#!/usr/bin/env node
/** Skip husky on Vercel/CI (no .git); install hooks locally only. */
if (process.env.CI || process.env.VERCEL || process.env.HUSKY === '0') {
  process.exit(0);
}
const { execSync } = require('child_process');
try {
  execSync('husky install', { stdio: 'inherit' });
} catch {
  process.exit(0);
}
