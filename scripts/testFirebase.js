#!/usr/bin/env node

/**
 * Simple Firebase Test Script
 * 
 * This script tests basic Firebase connectivity and data insertion
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');
const { config } = require('dotenv');

// Load environment variables
config({ path: '.env.local' });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('🔧 Firebase Config Check:');
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing');
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Present' : '❌ Missing');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test function
async function testFirebase() {
  try {
    console.log('\n🧪 Testing Firebase connection...');
    
    // Test 1: Simple document with minimal data
    console.log('\n📝 Test 1: Adding simple product...');
    const testProduct = {
      name: 'Test Product',
      version: '1.0',
      status: 'Active'
    };
    
    const docRef = await addDoc(collection(db, 'testProducts'), testProduct);
    console.log('✅ Test product added with ID:', docRef.id);
    
    // Test 2: Document with ID
    console.log('\n📝 Test 2: Adding product with custom ID...');
    const testProductWithId = {
      name: 'Test Product 2',
      version: '2.0',
      status: 'Active'
    };
    
    await setDoc(doc(db, 'testProducts', 'test-product-2'), testProductWithId);
    console.log('✅ Test product with ID added');
    
    console.log('\n🎉 All tests passed! Firebase is working correctly.');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
  }
}

// Run the test
testFirebase().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
