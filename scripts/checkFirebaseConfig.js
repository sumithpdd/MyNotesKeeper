#!/usr/bin/env node

/**
 * Firebase Configuration Checker
 * 
 * This script checks if your Firebase configuration is correct
 */

const { config } = require('dotenv');
const path = require('path');

// Load environment variables with explicit path
config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔧 Firebase Configuration Check:');
console.log('================================');

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
];

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allPresent = false;
  }
});

console.log('\n📋 Configuration Summary:');
if (allPresent) {
  console.log('✅ All required environment variables are present');
  console.log('🔍 Next: Check Firebase Security Rules');
} else {
  console.log('❌ Some environment variables are missing');
  console.log('📝 Please check your .env.local file');
}

console.log('\n🔗 Firebase Console Links:');
console.log(`📊 Firestore Database: https://console.firebase.google.com/u/0/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore`);
console.log(`🔒 Security Rules: https://console.firebase.google.com/u/0/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/rules`);
console.log(`⚙️  Project Settings: https://console.firebase.google.com/u/0/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/settings/general`);
