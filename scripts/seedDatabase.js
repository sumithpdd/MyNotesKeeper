#!/usr/bin/env node

/**
 * Database Seeding Script
 * 
 * This script seeds the Firebase database with real customer data from CSV files
 * and dummy data for testing purposes.
 * 
 * Usage:
 * 1. Make sure Firebase is configured in .env.local
 * 2. Run: node scripts/seedDatabase.js
 * 
 * The script will:
 * - Create all collections (customers, customerContacts, internalContacts, products, partners, customerNotes, customerProfiles)
 * - Populate with real data from CSV files
 * - Add dummy data for testing
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables with explicit path
config({ path: path.resolve(process.cwd(), '.env.local') });

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Real customer data from CSV files (simplified structure)
const realCustomers = [
  {
    id: 'customer-real-1',
    customerName: 'Barclays',
    website: 'https://www.barclays.ae/home/fraud-awareness/',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/barclays',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/1000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/barclays-notes',
    additionalInfo: 'Jus POC - Components and headless approach'
  },
  {
    id: 'customer-real-2',
    customerName: 'Marley',
    website: 'https://www.marley.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/marley',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/2000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/marley-notes',
    additionalInfo: 'A roofing, cement, solar and concrete company. Bought out by Marshalls who is on Umbraco. Interested in Personalisation, Uses Forms, CRM integration, Lead Gen, Selfservice, Search capability'
  },
  {
    id: 'customer-real-3',
    customerName: 'BUPA',
    website: 'https://www.bupa.com',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/bupa',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/3000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/bupa-notes',
    additionalInfo: 'Discovery call, with content hub and bupa. Bupa - Content Hub/Stream - Discovery'
  },
  {
    id: 'customer-real-4',
    customerName: 'MacMillan',
    website: 'https://www.macmillan.org.uk',
    sharePointUrl: 'https://company.sharepoint.com/sites/opportunities/macmillan',
    salesforceLink: 'https://company.lightning.force.com/lightning/r/Opportunity/4000000000000/view',
    additionalLink: 'https://loop.microsoft.com/loop/workspace/macmillan-notes',
    additionalInfo: 'Initial engagement'
  }
];

// Real internal contacts
const realInternalContacts = [
  { id: 'sc-daniella', name: 'Daniella Militaru', role: 'SE', email: 'daniella.militaru@sitecore.com' },
  { id: 'sc-ibrahim', name: 'Ibrahim Samy', role: 'Account Executive', email: 'ibrahim.samy@sitecore.com' },
  { id: 'sc-steve', name: 'Steve Little', role: 'Director SE UK and I', email: 'steve.little@sitecore.com' },
  { id: 'sc-james', name: 'James Prince', role: 'Account Executive', email: 'james.prince@sitecore.com' },
  { id: 'sc-paul', name: 'Paul Coombs', role: 'Account Executive', email: 'paul.coombs@sitecore.com' },
  { id: 'sc-tim', name: 'Tim Eijpe', role: 'Account Executive - Enterprise', email: 'tim.eijpe@sitecore.com' },
  { id: 'sc-diemen', name: 'Diemen Ysewyn', role: 'Account Executive', email: 'diemen.ysewyn@sitecore.com' }
];

// Real partners
const realPartners = [
  { id: 'partner-coforge', name: 'Coforge', type: 'Technology Services', website: 'https://www.coforge.com' },
  { id: 'partner-hugomrm', name: 'HugoMRM', type: 'Digital Agency', website: 'https://www.hugomrm.com' },
  { id: 'partner-graph', name: 'Graph Digital', type: 'Digital Agency', website: 'https://www.graphdigital.com' },
  { id: 'partner-ratio', name: 'RatioPartners', type: 'Consulting', website: 'https://www.ratiopartners.com' },
  { id: 'partner-dept', name: 'DEPT', type: 'Digital Agency', website: 'https://www.deptagency.com' },
  { id: 'partner-valtech', name: 'Valtech', type: 'Digital Agency', website: 'https://www.valtech.com' },
  { id: 'partner-sagittarius', name: 'Sagittarius', type: 'Digital Agency', website: 'https://www.sagittarius.com' },
  { id: 'partner-igodigital', name: 'iGoDigital', type: 'Digital Agency', website: 'https://www.igodigital.com' },
  { id: 'partner-tec', name: 'TEC Software Solutions', type: 'Technology Services', website: 'https://www.tecsoftware.com' },
  { id: 'partner-ethisys', name: 'Ethisys', type: 'Technology Services', website: 'https://www.ethisys.com' },
  { id: 'partner-vml', name: 'VML', type: 'Marketing Agency', website: 'https://www.vml.com' },
  { id: 'partner-idhl', name: 'IDHL', type: 'Digital Agency', website: 'https://www.idhl.com' },
  { id: 'partner-xcentium', name: 'xCentium', type: 'Technology Services', website: 'https://www.xcentium.com' }
];

// Products (simplified structure)
const products = [
  { id: 'product-xp-93', name: 'XP', version: '9.3', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xp-92', name: 'XP', version: '9.2', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xp-901', name: 'XP', version: '9.0.1', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xp-101', name: 'XP', version: '10.1', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xp-102', name: 'XP', version: '10.2', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xp-103', name: 'XP', version: '10.3', description: 'Experience Platform', status: 'Active' },
  { id: 'product-xm', name: 'XM', version: '10.3', description: 'Experience Manager', status: 'Active' },
  { id: 'product-xm-cloud', name: 'XM Cloud', version: 'Latest', description: 'Cloud-native headless CMS', status: 'Active' },
  { id: 'product-ordercloud', name: 'OrderCloud', version: '4.0', description: 'Commerce platform', status: 'Active' },
  { id: 'product-cdp', name: 'CDP', version: 'Latest', description: 'Customer Data Platform', status: 'Active' }
];

// Helper function to add documents to collection
async function addDocumentsToCollection(collectionName, documents) {
  try {
    console.log(`\n📦 Adding ${documents.length} documents to ${collectionName}...`);
    
    for (let i = 0; i < documents.length; i++) {
      const docData = documents[i];
      
      // Clean the document data - remove any undefined values and ensure proper types
      const cleanDocData = {};
      for (const [key, value] of Object.entries(docData)) {
        if (value !== undefined && value !== null) {
          // Convert Date objects to Firestore Timestamp
          if (value instanceof Date) {
            cleanDocData[key] = value;
          } else if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle nested objects
            cleanDocData[key] = value;
          } else {
            cleanDocData[key] = value;
          }
        }
      }
      
      // Add timestamps
      cleanDocData.createdAt = new Date();
      cleanDocData.updatedAt = new Date();
      
      // Use the document's ID if it exists, otherwise let Firestore generate one
      if (docData.id) {
        await setDoc(doc(db, collectionName, docData.id), cleanDocData);
      } else {
        await addDoc(collection(db, collectionName), cleanDocData);
      }
      
      // Progress indicator
      if ((i + 1) % 5 === 0 || i === documents.length - 1) {
        console.log(`   ✅ Added ${i + 1}/${documents.length} documents`);
      }
    }
    
    console.log(`✅ Successfully added ${documents.length} documents to ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error adding documents to ${collectionName}:`, error);
    console.error('Document data:', JSON.stringify(docData, null, 2));
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // 1. Seed Products
    console.log('\n📦 Seeding Products...');
    await addDocumentsToCollection('products', products);
    
    // 2. Seed Internal Contacts
    console.log('\n👥 Seeding Internal Contacts...');
    await addDocumentsToCollection('internalContacts', realInternalContacts);
    
    // 3. Seed Partners
    console.log('\n🤝 Seeding Partners...');
    await addDocumentsToCollection('partners', realPartners);
    
    // 4. Seed Customers
    console.log('\n🏢 Seeding Customers...');
    await addDocumentsToCollection('customers', realCustomers);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Products: ${products.length}`);
    console.log(`   Internal Contacts: ${realInternalContacts.length}`);
    console.log(`   Partners: ${realPartners.length}`);
    console.log(`   Customers: ${realCustomers.length}`);
    
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