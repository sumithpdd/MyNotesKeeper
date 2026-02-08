#!/usr/bin/env node

/**
 * Simple Firebase Seeding Script
 * 
 * This script seeds the Firebase database with basic data for testing
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');

// Firebase configuration - load from environment variables
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

console.log('🔧 Firebase Config Check:');
console.log('API Key:', firebaseConfig.apiKey ? '✅ Present' : '❌ Missing');
console.log('Project ID:', firebaseConfig.projectId ? '✅ Present' : '❌ Missing');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data
const testProducts = [
  { id: 'product-xp-103', name: 'XP', version: '10.3', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xm-cloud', name: 'XM Cloud', version: 'Latest', description: 'Cloud-native headless CMS', status: 'Active' }
];

const testCustomers = [
  {
    id: 'customer-barclays',
    customerName: 'Barclays',
    website: 'https://www.barclays.ae/home/fraud-awareness/',
    additionalInfo: 'Jus POC - Components and headless approach'
  },
  {
    id: 'customer-bupa',
    customerName: 'BUPA',
    website: 'https://www.bupa.com',
    additionalInfo: 'Discovery call, with content hub and bupa'
  }
];

// Helper function to add documents to collection
async function addDocumentsToCollection(collectionName, documents) {
  try {
    console.log(`\n📦 Adding ${documents.length} documents to ${collectionName}...`);
    
    for (let i = 0; i < documents.length; i++) {
      const docData = documents[i];
      
      // Clean the document data
      const cleanDocData = {
        ...docData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Use the document's ID if it exists
      if (docData.id) {
        await setDoc(doc(db, collectionName, docData.id), cleanDocData);
        console.log(`   ✅ Added ${docData.name || docData.customerName} (ID: ${docData.id})`);
      } else {
        const docRef = await addDoc(collection(db, collectionName), cleanDocData);
        console.log(`   ✅ Added document with ID: ${docRef.id}`);
      }
    }
    
    console.log(`✅ Successfully added ${documents.length} documents to ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error adding documents to ${collectionName}:`, error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // 1. Seed Products
    console.log('\n📦 Seeding Products...');
    await addDocumentsToCollection('products', testProducts);
    
    // 2. Seed Customers
    console.log('\n🏢 Seeding Customers...');
    await addDocumentsToCollection('customers', testCustomers);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Products: ${testProducts.length}`);
    console.log(`   Customers: ${testCustomers.length}`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { seedDatabase };
