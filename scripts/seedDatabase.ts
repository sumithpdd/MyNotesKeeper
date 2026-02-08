#!/usr/bin/env node

/**
 * Database Seeding Script
 * 
 * This script seeds the Firebase database with real customer data from CSV files
 * and dummy data for testing purposes.
 * 
 * Usage:
 * 1. Make sure Firebase is configured in .env.local
 * 2. Run: npx tsx scripts/seedDatabase.ts
 * 
 * The script will:
 * - Create all collections (customers, customerContacts, internalContacts, products, partners, customerNotes, customerProfiles)
 * - Populate with real data from CSV files
 * - Add dummy data for testing
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { config } from 'dotenv';
import { 
  generateRealCustomers, 
  realInternalContacts, 
  realPartners, 
  realProducts 
} from '../data/realCustomerData.js';
import { 
  generateDummyCustomers, 
  generateDummyNotes, 
  generateDummyCustomerProfiles,
  dummyCustomerContacts,
  dummyInternalContacts,
  dummyPartners,
  dummyProducts
} from '../data/dummyData.js';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to add documents to collection
async function addDocumentsToCollection(collectionName: string, documents: any[]): Promise<void> {
  try {
    console.log(`\n📦 Adding ${documents.length} documents to ${collectionName}...`);
    
    for (let i = 0; i < documents.length; i++) {
      const docData = documents[i];
      
      // Use the document's ID if it exists, otherwise let Firestore generate one
      if (docData.id) {
        await setDoc(doc(db, collectionName, docData.id), {
          ...docData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, collectionName), {
          ...docData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      // Progress indicator
      if ((i + 1) % 10 === 0 || i === documents.length - 1) {
        console.log(`   ✅ Added ${i + 1}/${documents.length} documents`);
      }
    }
    
    console.log(`✅ Successfully added ${documents.length} documents to ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error adding documents to ${collectionName}:`, error);
    throw error;
  }
}

// Main seeding function
async function seedDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database seeding...');
    
    // 1. Seed Products (real + dummy)
    console.log('\n📦 Seeding Products...');
    const allProducts = [...realProducts, ...dummyProducts];
    await addDocumentsToCollection('products', allProducts);
    
    // 2. Seed Customer Contacts (real + dummy)
    console.log('\n📞 Seeding Customer Contacts...');
    await addDocumentsToCollection('customerContacts', dummyCustomerContacts);
    
    // 3. Seed Internal Contacts (real + dummy)
    console.log('\n👥 Seeding Internal Contacts...');
    const allInternalContacts = [...realInternalContacts, ...dummyInternalContacts];
    await addDocumentsToCollection('internalContacts', allInternalContacts);
    
    // 4. Seed Partners (real + dummy)
    console.log('\n🤝 Seeding Partners...');
    const allPartners = [...realPartners, ...dummyPartners];
    await addDocumentsToCollection('partners', allPartners);
    
    // 5. Seed Customers (real + dummy)
    console.log('\n🏢 Seeding Customers...');
    const realCustomers = generateRealCustomers();
    const dummyCustomers = generateDummyCustomers();
    const allCustomers = [...realCustomers, ...dummyCustomers];
    await addDocumentsToCollection('customers', allCustomers);
    
    // 6. Seed Customer Notes
    console.log('\n📝 Seeding Customer Notes...');
    const customerNotes = generateDummyNotes();
    await addDocumentsToCollection('customerNotes', customerNotes);
    
    // 7. Seed Customer Profiles
    console.log('\n👤 Seeding Customer Profiles...');
    const customerProfiles = generateDummyCustomerProfiles();
    await addDocumentsToCollection('customerProfiles', customerProfiles);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Products: ${allProducts.length}`);
    console.log(`   Customer Contacts: ${dummyCustomerContacts.length}`);
    console.log(`   Internal Contacts: ${allInternalContacts.length}`);
    console.log(`   Partners: ${allPartners.length}`);
    console.log(`   Customers: ${allCustomers.length}`);
    console.log(`   Customer Notes: ${customerNotes.length}`);
    console.log(`   Customer Profiles: ${customerProfiles.length}`);
    
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

export { seedDatabase };
