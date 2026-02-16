/**
 * Data Consistency Check
 * 
 * Verifies database normalization is complete and consistent
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const serviceAccountJson = await readFile(path.join(__dirname, '../serviceAccountKey.json'), 'utf-8');
const serviceAccount = JSON.parse(serviceAccountJson);

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

interface ConsistencyReport {
  totalCustomers: number;
  customersWithContactIds: number;
  customersWithEmbeddedContacts: number;
  customersWithAccountExecutiveId: number;
  customersWithEmbeddedAccountExecutive: number;
  customersWithProductIds: number;
  customersWithEmbeddedProducts: number;
  customersWithPartnerIds: number;
  customersWithEmbeddedPartners: number;
  totalCustomerContacts: number;
  totalInternalContacts: number;
  totalProducts: number;
  totalPartners: number;
  orphanedContactIds: string[];
  issues: string[];
}

const report: ConsistencyReport = {
  totalCustomers: 0,
  customersWithContactIds: 0,
  customersWithEmbeddedContacts: 0,
  customersWithAccountExecutiveId: 0,
  customersWithEmbeddedAccountExecutive: 0,
  customersWithProductIds: 0,
  customersWithEmbeddedProducts: 0,
  customersWithPartnerIds: 0,
  customersWithEmbeddedPartners: 0,
  totalCustomerContacts: 0,
  totalInternalContacts: 0,
  totalProducts: 0,
  totalPartners: 0,
  orphanedContactIds: [],
  issues: []
};

async function checkConsistency() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 DATA CONSISTENCY CHECK');
  console.log('═══════════════════════════════════════════════════\n');

  // Get all collections
  const [customersSnap, customerContactsSnap, internalContactsSnap, productsSnap, partnersSnap] = await Promise.all([
    db.collection('customers').get(),
    db.collection('customerContacts').get(),
    db.collection('internalContacts').get(),
    db.collection('products').get(),
    db.collection('partners').get()
  ]);

  report.totalCustomers = customersSnap.size;
  report.totalCustomerContacts = customerContactsSnap.size;
  report.totalInternalContacts = internalContactsSnap.size;
  report.totalProducts = productsSnap.size;
  report.totalPartners = partnersSnap.size;

  // Build entity ID sets
  const customerContactIds = new Set<string>();
  const internalContactIds = new Set<string>();
  const productIds = new Set<string>();
  const partnerIds = new Set<string>();

  customerContactsSnap.forEach(doc => customerContactIds.add(doc.id));
  internalContactsSnap.forEach(doc => internalContactIds.add(doc.id));
  productsSnap.forEach(doc => productIds.add(doc.id));
  partnersSnap.forEach(doc => partnerIds.add(doc.id));

  console.log('📊 COLLECTION SIZES:');
  console.log(`   Customers:           ${report.totalCustomers}`);
  console.log(`   Customer Contacts:   ${report.totalCustomerContacts}`);
  console.log(`   Internal Contacts:   ${report.totalInternalContacts}`);
  console.log(`   Products:            ${report.totalProducts}`);
  console.log(`   Partners:            ${report.totalPartners}\n`);

  console.log('🔍 CHECKING CUSTOMER NORMALIZATION...\n');

  // Check each customer
  customersSnap.forEach(doc => {
    const data = doc.data();
    
    // Check customerContactIds
    if (data.customerContactIds && Array.isArray(data.customerContactIds)) {
      report.customersWithContactIds++;
      
      // Check if IDs exist in collection
      data.customerContactIds.forEach((id: string) => {
        if (!customerContactIds.has(id)) {
          report.orphanedContactIds.push(`Customer ${doc.id} references missing customerContact: ${id}`);
        }
      });
    }
    
    // Check for embedded contacts (old format)
    if (data.customerContacts && Array.isArray(data.customerContacts) && data.customerContacts.length > 0) {
      report.customersWithEmbeddedContacts++;
      report.issues.push(`❌ Customer "${data.customerName}" (${doc.id}) still has embedded customerContacts`);
    }
    
    if (data.internalContacts && Array.isArray(data.internalContacts) && data.internalContacts.length > 0) {
      report.customersWithEmbeddedContacts++;
      report.issues.push(`❌ Customer "${data.customerName}" (${doc.id}) still has embedded internalContacts`);
    }
    
    // Check accountExecutiveId
    if (data.accountExecutiveId) {
      report.customersWithAccountExecutiveId++;
      
      // Check if ID exists in collection
      if (!internalContactIds.has(data.accountExecutiveId)) {
        report.orphanedContactIds.push(`Customer ${doc.id} references missing accountExecutive: ${data.accountExecutiveId}`);
      }
    }
    
    // Check for embedded account executive (old format)
    if (data.accountExecutive && typeof data.accountExecutive === 'object' && data.accountExecutive.name) {
      report.customersWithEmbeddedAccountExecutive++;
      report.issues.push(`❌ Customer "${data.customerName}" (${doc.id}) still has embedded accountExecutive`);
    }
    
    // Check productIds
    if (data.productIds && Array.isArray(data.productIds)) {
      report.customersWithProductIds++;
      
      // Check if IDs exist in collection
      data.productIds.forEach((id: string) => {
        if (!productIds.has(id)) {
          report.orphanedContactIds.push(`Customer ${doc.id} references missing product: ${id}`);
        }
      });
    }
    
    // Check for embedded products (old format)
    if (data.products && Array.isArray(data.products) && data.products.length > 0) {
      report.customersWithEmbeddedProducts++;
      report.issues.push(`❌ Customer "${data.customerName}" (${doc.id}) still has embedded products`);
    }
    
    // Check partnerIds
    if (data.partnerIds && Array.isArray(data.partnerIds)) {
      report.customersWithPartnerIds++;
      
      // Check if IDs exist in collection
      data.partnerIds.forEach((id: string) => {
        if (!partnerIds.has(id)) {
          report.orphanedContactIds.push(`Customer ${doc.id} references missing partner: ${id}`);
        }
      });
    }
    
    // Check for embedded partners (old format)
    if (data.partners && Array.isArray(data.partners) && data.partners.length > 0) {
      report.customersWithEmbeddedPartners++;
      report.issues.push(`❌ Customer "${data.customerName}" (${doc.id}) still has embedded partners`);
    }
  });

  // Print report
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 CONSISTENCY REPORT');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('✅ NORMALIZATION STATUS:');
  console.log(`   Customers using contact ID refs:      ${report.customersWithContactIds}/${report.totalCustomers}`);
  console.log(`   Customers with accountExecutiveId:    ${report.customersWithAccountExecutiveId}/${report.totalCustomers}`);
  console.log(`   Customers with productIds:            ${report.customersWithProductIds}/${report.totalCustomers}`);
  console.log(`   Customers with partnerIds:            ${report.customersWithPartnerIds}/${report.totalCustomers}`);
  console.log(`   Customers with embedded contacts:     ${report.customersWithEmbeddedContacts}`);
  console.log(`   Customers with embedded accountExec:  ${report.customersWithEmbeddedAccountExecutive}`);
  console.log(`   Customers with embedded products:     ${report.customersWithEmbeddedProducts}`);
  console.log(`   Customers with embedded partners:     ${report.customersWithEmbeddedPartners}\n`);

  if (report.orphanedContactIds.length > 0) {
    console.log('⚠️  ORPHANED REFERENCES:');
    report.orphanedContactIds.forEach(issue => console.log(`   ${issue}`));
    console.log('');
  }

  if (report.issues.length > 0) {
    console.log('❌ ISSUES FOUND:');
    report.issues.forEach(issue => console.log(`   ${issue}`));
    console.log('');
  }

  // Calculate percentages
  const normalizedPercent = ((report.customersWithContactIds / report.totalCustomers) * 100).toFixed(1);
  const accountExecPercent = report.customersWithAccountExecutiveId > 0 
    ? ((report.customersWithAccountExecutiveId / report.totalCustomers) * 100).toFixed(1)
    : '0.0';

  console.log('═══════════════════════════════════════════════════');
  if (report.issues.length === 0 && report.orphanedContactIds.length === 0) {
    console.log('✅ DATABASE IS FULLY NORMALIZED AND CONSISTENT!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n📊 ${normalizedPercent}% of customers use normalized references`);
    console.log(`📊 ${accountExecPercent}% of customers have account executive assigned\n`);
  } else {
    console.log('⚠️  INCONSISTENCIES DETECTED');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n${report.issues.length} issue(s) found`);
    console.log(`${report.orphanedContactIds.length} orphaned reference(s) found\n`);
    console.log('💡 Run migration script to fix issues:');
    console.log('   npx ts-node scripts/migrateContactsToReferences.ts\n');
  }

  process.exit(0);
}

// Run check
checkConsistency();
