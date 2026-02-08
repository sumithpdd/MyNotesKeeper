#!/usr/bin/env node

/**
 * Upload Migration Opportunities Script
 * 
 * This script uploads migration opportunity data from a CSV file to Firebase.
 * The CSV should have the following columns (with or without ?):
 * - Account Owner (Internal Contact)
 * - Account Name (Customer)
 * - xM or XP? (Product)
 * - Version
 * - Perpetual or Subscription
 * - Hosting Location
 * - Front End Tech
 * - EXM User?
 * - Marketing Automation User?
 * - Integrations?
 * - Heavily customised CE
 * - Migration Complexity
 * - Customer aware of XMC?
 * - Compelling Event?
 * - Managed Cloud?
 * - Date Analysed
 * - Existing Migration Opp?
 * - Notes
 * - Managing Partner
 * 
 * Usage: node scripts/uploadMigrationOpportunities.ts <csv-file-path>
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

// Firebase configuration - load from environment variables
// Make sure to run: npm install dotenv
require('dotenv').config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to generate ID from name
function generateId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Helper function to normalize field names (remove ?)
function normalizeFieldName(fieldName: string): string {
  return fieldName.replace(/\?/g, '').trim();
}

// Helper function to clean data
function cleanValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value.trim();
  if (cleaned === '-' || cleaned === '' || cleaned.toLowerCase() === 'n/a' || cleaned === '?') return undefined;
  
  // Remove special characters that might cause issues
  const sanitized = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Remove control characters
  return sanitized || undefined;
}

// Helper function to convert yes/no to boolean
function convertYesNoToBoolean(value: string | undefined): boolean | 'yes' | 'no' | undefined {
  if (!value) return undefined;
  const lower = value.trim().toLowerCase();
  if (lower === 'yes' || lower === 'y') return 'yes';
  if (lower === 'no' || lower === 'n') return 'no';
  return undefined;
}

// Helper function to find existing customer by name
async function findCustomerByName(customerName: string): Promise<string | null> {
  try {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('customerName', '==', customerName));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error finding customer:', error);
    return null;
  }
}

// Helper function to find or create customer
async function findOrCreateCustomer(customerName: string): Promise<string> {
  try {
    // Try to find existing customer
    const existingId = await findCustomerByName(customerName);
    if (existingId) {
      console.log(`Found existing customer: ${customerName}`);
      return existingId;
    }
    
    // Create new customer
    const customerId = generateId(customerName);
    const customerRef = doc(db, 'customers', customerId);
    
    await setDoc(customerRef, {
      id: customerId,
      customerName: customerName,
      website: `https://www.${customerName.toLowerCase().replace(/\s+/g, '-')}.com`,
      products: [],
      customerContacts: [],
      internalContacts: [],
      partners: [],
      sharePointUrl: `https://company.sharepoint.com/sites/opportunities/${customerId}`,
      salesforceLink: `https://company.lightning.force.com/lightning/r/Opportunity/${customerId}/view`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`Created new customer: ${customerName} (ID: ${customerId})`);
    return customerId;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

// Main function to update customer with migration opportunity data
async function updateCustomerWithMigrationOpp(row: any): Promise<void> {
  try {
    // Map CSV columns (handle both with and without ?, handle empty strings and dashes)
    const accountOwner = cleanValue(row['Account Owner'] || row['Account Owner?'] || row['']);
    const accountName = cleanValue(row['Account Name'] || row['Account Name?'] || row['']) || 'Unknown';
    const product = cleanValue(row['xM or XP'] || row['xM or XP?'] || row['']);
    const version = cleanValue(row['Version']);
    const perpetualOrSubscription = cleanValue(row['Perpetual or Subscription']);
    const hostingLocation = cleanValue(row['Hosting Location']);
    const frontEndTech = cleanValue(row['Front End Tech']);
    const exmUser = convertYesNoToBoolean(row['EXM User'] || row['EXM User?'] || row['']);
    const marketingAutomationUser = convertYesNoToBoolean(row['Marketing Automation User'] || row['Marketing Automation User?'] || row['']);
    const integrations = cleanValue(row['Integrations'] || row['Integrations?'] || row['']);
    const heavilyCustomisedCE = convertYesNoToBoolean(row['Heavily customised CE'] || row['Heavily customised CE?'] || row['']);
    const migrationComplexity = cleanValue(row['Migration Complexity']);
    const customerAwareOfXMC = convertYesNoToBoolean(row['Customer aware of XMC'] || row['Customer aware of XMC?'] || row['']);
    const compellingEvent = cleanValue(row['Compelling Event'] || row['Compelling Event?'] || row['']);
    const managedCloud = convertYesNoToBoolean(row['Managed Cloud'] || row['Managed Cloud?'] || row['']);
    const dateAnalysed = cleanValue(row['Date Analysed']);
    const existingMigrationOpp = cleanValue(row['Existing Migration Opp'] || row['Existing Migration Opp?'] || row['']);
    const notes = cleanValue(row['Notes'] || row['']);
    
    console.log(`\n🚀 Processing: ${accountName}`);
    
    // Find or create customer
    const customerId = await findOrCreateCustomer(accountName);
    
    // Get existing customer
    const customerRef = doc(db, 'customers', customerId);
    const customerDoc = await getDoc(customerRef);
    
    if (!customerDoc.exists()) {
      throw new Error(`Customer ${accountName} not found`);
    }
    
    const existingCustomer = customerDoc.data();
    
    // Update customer with migration opportunity fields
    const updates: any = {
      existingMigrationOpp: existingMigrationOpp || 'no',
      updatedAt: new Date(),
    };
    
    // Only update fields that have values
    if (perpetualOrSubscription) updates.perpetualOrSubscription = perpetualOrSubscription;
    if (hostingLocation) updates.hostingLocation = hostingLocation;
    if (frontEndTech) updates.frontEndTech = frontEndTech;
    if (exmUser !== undefined) updates.exmUser = exmUser;
    if (marketingAutomationUser !== undefined) updates.marketingAutomationUser = marketingAutomationUser;
    if (integrations) updates.integrations = integrations;
    if (heavilyCustomisedCE !== undefined) updates.heavilyCustomisedCE = heavilyCustomisedCE;
    if (migrationComplexity) updates.migrationComplexity = migrationComplexity;
    if (customerAwareOfXMC !== undefined) updates.customerAwareOfXMC = customerAwareOfXMC;
    if (compellingEvent) updates.compellingEvent = compellingEvent;
    if (managedCloud !== undefined) updates.managedCloud = managedCloud;
    if (dateAnalysed) updates.dateAnalysed = dateAnalysed;
    if (notes) updates.mergedNotes = notes;
    
    // Add product if it doesn't exist
    if (product && version) {
      const productToAdd = {
        id: generateId(`${product}-${version}`),
        name: product,
        version: version,
        description: `${product} - Experience Platform`,
        status: 'Active' as const
      };
      
      const existingProducts = existingCustomer.products || [];
      const productExists = existingProducts.some((p: any) => p.name === product && p.version === version);
      
      if (!productExists) {
        updates.products = [...existingProducts, productToAdd];
      }
    }
    
    // Update the customer
    await updateDoc(customerRef, updates);
    
    console.log(`✅ Updated customer with migration data: ${accountName}`);
    
  } catch (error) {
    console.error('❌ Error updating customer with migration data:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    const csvFilePath = process.argv[2];
    
    if (!csvFilePath) {
      console.log('❌ Please provide a CSV file path');
      console.log('Usage: node scripts/uploadMigrationOpportunities.ts <csv-file-path>');
      process.exit(1);
    }
    
    if (!fs.existsSync(csvFilePath)) {
      console.log(`❌ CSV file not found: ${csvFilePath}`);
      process.exit(1);
    }
    
    console.log('🌱 Starting migration opportunity upload...');
    console.log(`📄 Reading CSV file: ${csvFilePath}`);
    
    // Read and parse CSV
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim() && !line.match(/^,+$/));
    
    // Find the header line (first line with non-empty content after trimming)
    let headerLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed && !trimmed.match(/^,+$/)) {
        headerLineIndex = i;
        break;
      }
    }
    
    if (headerLineIndex === -1) {
      throw new Error('Could not find header row in CSV');
    }
    
    const headers = lines[headerLineIndex].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Filter out empty headers (first column)
    const filteredHeaders: string[] = [];
    const headerIndices: number[] = [];
    headers.forEach((header, index) => {
      if (header && header !== '') {
        filteredHeaders.push(header);
        headerIndices.push(index);
      }
    });
    
    console.log(`📊 Found headers (${filteredHeaders.length}): ${filteredHeaders.join(', ')}`);
    
    const rows: any[] = [];
    for (let i = headerLineIndex + 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      // Map values to filtered headers
      filteredHeaders.forEach((header, idx) => {
        const valueIndex = headerIndices[idx];
        row[header] = values[valueIndex] || '';
      });
      
      // Only process rows that have at least an account name
      const accountName = row['Account Name'];
      if (!accountName || accountName === '' || accountName === '-') {
        continue;
      }
      
      rows.push(row);
    }
    
    console.log(`📊 Found ${rows.length} data rows in CSV`);
    
    // Update each customer with migration opportunity data
    let successCount = 0;
    let errorCount = 0;
    
    for (const row of rows) {
      try {
        await updateCustomerWithMigrationOpp(row);
        successCount++;
      } catch (error) {
        console.error('❌ Error processing row:', row);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Customer migration data upload completed!');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total: ${rows.length}`);
    console.log('\n📝 Migration opportunities can be filtered by the "existingMigrationOpp" flag');
    console.log('   Set to "yes" or "YES" to mark as a migration opportunity');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});

export { updateCustomerWithMigrationOpp };

