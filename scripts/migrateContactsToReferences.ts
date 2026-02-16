/**
 * Migration Script: Convert Embedded Contacts to References
 * 
 * This script migrates customer data from:
 *   OLD: customers { customerContacts: [full objects], internalContacts: [full objects] }
 *   NEW: customers { customerContactIds: [IDs], internalContactIds: [IDs] }
 * 
 * Run with: npx ts-node scripts/migrateContactsToReferences.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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

interface MigrationStats {
  customersProcessed: number;
  customersUpdated: number;
  customerContactsCreated: number;
  customerContactsReused: number;
  internalContactsCreated: number;
  internalContactsReused: number;
  productsCreated: number;
  productsReused: number;
  partnersCreated: number;
  partnersReused: number;
  errors: string[];
}

const stats: MigrationStats = {
  customersProcessed: 0,
  customersUpdated: 0,
  customerContactsCreated: 0,
  customerContactsReused: 0,
  internalContactsCreated: 0,
  internalContactsReused: 0,
  productsCreated: 0,
  productsReused: 0,
  partnersCreated: 0,
  partnersReused: 0,
  errors: []
};

/**
 * Create or get existing customer contact
 */
async function getOrCreateCustomerContact(contact: any): Promise<string> {
  try {
    // Check if contact already exists (by name and email)
    const existingQuery = await db.collection('customerContacts')
      .where('name', '==', contact.name)
      .limit(1)
      .get();
    
    if (!existingQuery.empty) {
      const existingDoc = existingQuery.docs[0];
      console.log(`  ⏭️  Reusing customer contact: ${contact.name}`);
      stats.customerContactsReused++;
      return existingDoc.id;
    }
    
    // Create new contact
    const docRef = await db.collection('customerContacts').add({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log(`  ✅ Created customer contact: ${contact.name} (${docRef.id})`);
    stats.customerContactsCreated++;
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Error creating customer contact:`, error);
    stats.errors.push(`Customer contact error: ${contact.name}`);
    throw error;
  }
}

/**
 * Create or get existing product
 */
async function getOrCreateProduct(product: any): Promise<string> {
  try {
    // Check if product already exists (by name)
    const existingQuery = await db.collection('products')
      .where('name', '==', product.name)
      .limit(1)
      .get();
    
    if (!existingQuery.empty) {
      const existingDoc = existingQuery.docs[0];
      console.log(`  ⏭️  Reusing product: ${product.name}`);
      stats.productsReused++;
      return existingDoc.id;
    }
    
    // Create new product
    const docRef = await db.collection('products').add({
      name: product.name || '',
      description: product.description || '',
      version: product.version || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log(`  ✅ Created product: ${product.name} (${docRef.id})`);
    stats.productsCreated++;
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Error creating product:`, error);
    stats.errors.push(`Product error: ${product.name}`);
    throw error;
  }
}

/**
 * Create or get existing partner
 */
async function getOrCreatePartner(partner: any): Promise<string> {
  try {
    // Check if partner already exists (by name)
    const existingQuery = await db.collection('partners')
      .where('name', '==', partner.name)
      .limit(1)
      .get();
    
    if (!existingQuery.empty) {
      const existingDoc = existingQuery.docs[0];
      console.log(`  ⏭️  Reusing partner: ${partner.name}`);
      stats.partnersReused++;
      return existingDoc.id;
    }
    
    // Create new partner
    const docRef = await db.collection('partners').add({
      name: partner.name || '',
      type: partner.type || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log(`  ✅ Created partner: ${partner.name} (${docRef.id})`);
    stats.partnersCreated++;
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Error creating partner:`, error);
    stats.errors.push(`Partner error: ${partner.name}`);
    throw error;
  }
}

/**
 * Create or get existing internal contact
 */
async function getOrCreateInternalContact(contact: any): Promise<string> {
  try {
    // Check if contact already exists (by email or name)
    let existingQuery;
    if (contact.email) {
      existingQuery = await db.collection('internalContacts')
        .where('email', '==', contact.email)
        .limit(1)
        .get();
    } else {
      existingQuery = await db.collection('internalContacts')
        .where('name', '==', contact.name)
        .limit(1)
        .get();
    }
    
    if (!existingQuery.empty) {
      const existingDoc = existingQuery.docs[0];
      console.log(`  ⏭️  Reusing internal contact: ${contact.name}`);
      stats.internalContactsReused++;
      return existingDoc.id;
    }
    
    // Create new contact
    const docRef = await db.collection('internalContacts').add({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log(`  ✅ Created internal contact: ${contact.name} (${docRef.id})`);
    stats.internalContactsCreated++;
    return docRef.id;
  } catch (error) {
    console.error(`  ❌ Error creating internal contact:`, error);
    stats.errors.push(`Internal contact error: ${contact.name}`);
    throw error;
  }
}

/**
 * Migrate a single customer
 */
async function migrateCustomer(customerId: string, customerData: any): Promise<void> {
  try {
    console.log(`\n📋 Processing customer: ${customerData.customerName} (${customerId})`);
    
    let needsUpdate = false;
    const updates: any = {};
    
    // Check if needs migration
    const needsAccountExecutiveMigration = 
      customerData.accountExecutive && 
      typeof customerData.accountExecutive === 'object' && 
      customerData.accountExecutive.name;
    
    const needsProductMigration = 
      customerData.products && 
      Array.isArray(customerData.products) && 
      customerData.products.length > 0 &&
      !customerData.productIds;
    
    const needsPartnerMigration = 
      customerData.partners && 
      Array.isArray(customerData.partners) && 
      customerData.partners.length > 0 &&
      !customerData.partnerIds;
    
    if (customerData.customerContactIds && 
        customerData.internalContactIds && 
        !needsAccountExecutiveMigration &&
        !needsProductMigration &&
        !needsPartnerMigration) {
      console.log(`  ⏭️  Already migrated, skipping...`);
      return;
    }
    
    // Process customer contacts (skip if already migrated)
    const customerContactIds: string[] = [];
    if (customerData.customerContacts && Array.isArray(customerData.customerContacts) && !customerData.customerContactIds) {
      console.log(`  👥 Migrating ${customerData.customerContacts.length} customer contact(s)...`);
      
      for (const contact of customerData.customerContacts) {
        if (contact && contact.name) {
          const contactId = await getOrCreateCustomerContact(contact);
          customerContactIds.push(contactId);
        }
      }
      
      updates.customerContactIds = customerContactIds;
      updates.customerContacts = []; // Clear old embedded data
      needsUpdate = true;
    } else {
      updates.customerContactIds = [];
    }
    
    // Process internal contacts (skip if already migrated)
    const internalContactIds: string[] = [];
    if (customerData.internalContacts && Array.isArray(customerData.internalContacts) && !customerData.internalContactIds) {
      console.log(`  🏢 Migrating ${customerData.internalContacts.length} internal contact(s)...`);
      
      for (const contact of customerData.internalContacts) {
        if (contact && contact.name) {
          const contactId = await getOrCreateInternalContact(contact);
          internalContactIds.push(contactId);
        }
      }
      
      updates.internalContactIds = internalContactIds;
      updates.internalContacts = []; // Clear old embedded data
      needsUpdate = true;
    } else {
      updates.internalContactIds = [];
    }
    
    // Process account executive (if full object, convert to ID reference)
    if (customerData.accountExecutive && typeof customerData.accountExecutive === 'object' && customerData.accountExecutive.name) {
      console.log(`  👤 Migrating account executive: ${customerData.accountExecutive.name}...`);
      const accountExecutiveId = await getOrCreateInternalContact(customerData.accountExecutive);
      updates.accountExecutiveId = accountExecutiveId;
      updates.accountExecutive = null; // Clear old embedded data
      needsUpdate = true;
      console.log(`     ✅ Account Executive ID: ${accountExecutiveId}`);
    } else if (customerData.accountExecutive && typeof customerData.accountExecutive === 'string') {
      // Already migrated (has ID)
      updates.accountExecutiveId = customerData.accountExecutive;
      updates.accountExecutive = null;
    }
    
    // Process products (skip if already migrated)
    const productIds: string[] = [];
    if (customerData.products && Array.isArray(customerData.products) && !customerData.productIds) {
      console.log(`  📦 Migrating ${customerData.products.length} product(s)...`);
      
      for (const product of customerData.products) {
        if (product && product.name) {
          const productId = await getOrCreateProduct(product);
          productIds.push(productId);
        }
      }
      
      updates.productIds = productIds;
      updates.products = []; // Clear old embedded data
      needsUpdate = true;
    } else if (!customerData.productIds) {
      updates.productIds = [];
    }
    
    // Process partners (skip if already migrated)
    const partnerIds: string[] = [];
    if (customerData.partners && Array.isArray(customerData.partners) && !customerData.partnerIds) {
      console.log(`  🤝 Migrating ${customerData.partners.length} partner(s)...`);
      
      for (const partner of customerData.partners) {
        if (partner && partner.name) {
          const partnerId = await getOrCreatePartner(partner);
          partnerIds.push(partnerId);
        }
      }
      
      updates.partnerIds = partnerIds;
      updates.partners = []; // Clear old embedded data
      needsUpdate = true;
    } else if (!customerData.partnerIds) {
      updates.partnerIds = [];
    }
    
    // Update customer document
    if (needsUpdate) {
      await db.collection('customers').doc(customerId).update({
        ...updates,
        updatedAt: Timestamp.now()
      });
      
      console.log(`  ✅ Updated customer: ${customerData.customerName}`);
      console.log(`     Customer Contact IDs: [${customerContactIds.join(', ')}]`);
      console.log(`     Internal Contact IDs: [${internalContactIds.join(', ')}]`);
      if (updates.accountExecutiveId) {
        console.log(`     Account Executive ID: ${updates.accountExecutiveId}`);
      }
      if (productIds.length > 0) {
        console.log(`     Product IDs: [${productIds.join(', ')}]`);
      }
      if (partnerIds.length > 0) {
        console.log(`     Partner IDs: [${partnerIds.join(', ')}]`);
      }
      stats.customersUpdated++;
    }
    
    stats.customersProcessed++;
  } catch (error) {
    console.error(`  ❌ Error migrating customer ${customerId}:`, error);
    stats.errors.push(`Customer error: ${customerId} - ${customerData.customerName}`);
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 STARTING CONTACT MIGRATION');
  console.log('═══════════════════════════════════════════════════');
  console.log('Converting embedded contacts to normalized references...\n');
  
  try {
    // Get all customers
    const customersSnapshot = await db.collection('customers').get();
    console.log(`📊 Found ${customersSnapshot.size} customer(s) to process\n`);
    
    // Process each customer
    for (const doc of customersSnapshot.docs) {
      await migrateCustomer(doc.id, doc.data());
    }
    
    // Print final statistics
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ MIGRATION COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n📊 STATISTICS:`);
    console.log(`   Customers Processed:         ${stats.customersProcessed}`);
    console.log(`   Customers Updated:           ${stats.customersUpdated}`);
    console.log(`   Customer Contacts Created:   ${stats.customerContactsCreated}`);
    console.log(`   Customer Contacts Reused:    ${stats.customerContactsReused}`);
    console.log(`   Internal Contacts Created:   ${stats.internalContactsCreated}`);
    console.log(`   Internal Contacts Reused:    ${stats.internalContactsReused}`);
    console.log(`   Products Created:            ${stats.productsCreated}`);
    console.log(`   Products Reused:             ${stats.productsReused}`);
    console.log(`   Partners Created:            ${stats.partnersCreated}`);
    console.log(`   Partners Reused:             ${stats.partnersReused}`);
    console.log(`   Errors:                      ${stats.errors.length}`);
    
    if (stats.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      stats.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n═══════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run migration
runMigration();
