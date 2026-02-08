// Quick script to check if environment variables are loaded
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
  'NEXT_PUBLIC_GEMINI_API_KEY'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const preview = value ? `${value.substring(0, 20)}...` : 'MISSING';
  console.log(`${status} ${varName}: ${preview}`);
  if (!value) allPresent = false;
});

console.log('\n' + (allPresent ? '✅ All environment variables are set!' : '❌ Some environment variables are missing!'));
console.log('\n📝 Make sure your .env.local file contains all required variables.');
console.log('🔄 After updating .env.local, restart your dev server (Ctrl+C then npm run dev)');

