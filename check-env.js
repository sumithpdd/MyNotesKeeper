// Quick script to check if environment variables are loaded (values are never printed)
// Run with: node check-env.js

require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Environment Variables...\n');

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'GEMINI_API_KEY',
];

const optionalVars = ['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'];

let allPresent = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const preview = value ? '(configured — value hidden)' : 'MISSING';
  console.log(`${status} ${varName}: ${preview}`);
  if (!value) allPresent = false;
});

optionalVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? '✅' : '○';
  const preview = value ? '(configured — value hidden)' : 'optional — not set';
  console.log(`${status} ${varName}: ${preview}`);
});

console.log(
  '\n' +
    (allPresent
      ? '✅ All required environment variables are set!'
      : '❌ Some required environment variables are missing!'),
);
console.log('\n📝 Use .env.local for real values. Never commit secrets.');
console.log('🔄 After updating .env.local, restart your dev server (Ctrl+C then npm run dev).\n');
