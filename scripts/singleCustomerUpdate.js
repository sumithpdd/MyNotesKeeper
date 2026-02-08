#!/usr/bin/env node

/**
 * Single Customer Update Script
 * 
 * This script allows you to update a single customer in the Firebase database
 * by providing a JSON file with customer details.
 * 
 * Usage:
 * 1. Create a singleCustomer.json file with customer details
 * 2. Run: node scripts/singleCustomerUpdate.js
 * 
 * The script will:
 * - Create or update the customer
 * - Create/update customer contacts if they don't exist
 * - Create/update internal contacts if they don't exist
 * - Create/update products if they don't exist
 * - Create/update partners if they don't exist
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } = require('firebase/firestore');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

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

// Helper function to generate ID from name
function generateId(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Helper function to find or create contact
async function findOrCreateContact(contact, collectionName) {
  try {
    // Try to find existing contact by email
    const contactsRef = collection(db, collectionName);
    const q = query(contactsRef, where('email', '==', contact.email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingContact = querySnapshot.docs[0];
      console.log(`Found existing ${collectionName}: ${contact.name} (${contact.email})`);
      return existingContact.id;
    }
    
    // Create new contact
    const docRef = await addDoc(contactsRef, {
      ...contact,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`Created new ${collectionName}: ${contact.name} (${contact.email}) with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`Error processing ${collectionName}:`, error);
    throw error;
  }
}

// Helper function to find or create product
async function findOrCreateProduct(product) {
  try {
    // Try to find existing product by name and version
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('name', '==', product.name), where('version', '==', product.version));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingProduct = querySnapshot.docs[0];
      console.log(`Found existing product: ${product.name} ${product.version}`);
      return existingProduct.id;
    }
    
    // Create new product
    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`Created new product: ${product.name} ${product.version} with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error processing product:', error);
    throw error;
  }
}

// Helper function to find or create partner
async function findOrCreatePartner(partner) {
  try {
    // Try to find existing partner by name
    const partnersRef = collection(db, 'partners');
    const q = query(partnersRef, where('name', '==', partner.name));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingPartner = querySnapshot.docs[0];
      console.log(`Found existing partner: ${partner.name}`);
      return existingPartner.id;
    }
    
    // Create new partner
    const docRef = await addDoc(partnersRef, {
      ...partner,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`Created new partner: ${partner.name} with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error processing partner:', error);
    throw error;
  }
}

// Main function to update customer
async function updateCustomer(customerData) {
  try {
    console.log(`\n🚀 Starting customer update for: ${customerData.customerName}`);
    
    // Generate customer ID
    const customerId = generateId(customerData.customerName);
    
    // Process customer contacts
    const customerContactIds = [];
    if (customerData.customerContacts) {
      console.log('\n📞 Processing customer contacts...');
      for (const contact of customerData.customerContacts) {
        const contactId = await findOrCreateContact(contact, 'customerContacts');
        customerContactIds.push(contactId);
      }
    }
    
    // Process internal contacts
    const internalContactIds = [];
    if (customerData.internalContacts) {
      console.log('\n👥 Processing internal contacts...');
      for (const contact of customerData.internalContacts) {
        const contactId = await findOrCreateContact(contact, 'internalContacts');
        internalContactIds.push(contactId);
      }
    }
    
    // Process products
    const productIds = [];
    if (customerData.products) {
      console.log('\n📦 Processing products...');
      for (const product of customerData.products) {
        const productId = await findOrCreateProduct(product);
        productIds.push(productId);
      }
    }
    
    // Process partners
    const partnerIds = [];
    if (customerData.partners) {
      console.log('\n🤝 Processing partners...');
      for (const partner of customerData.partners) {
        const partnerId = await findOrCreatePartner(partner);
        partnerIds.push(partnerId);
      }
    }
    
    // Create or update customer
    console.log('\n🏢 Creating/updating customer...');
    const customerRef = doc(db, 'customers', customerId);
    
    const customerDoc = {
      id: customerId,
      customerName: customerData.customerName,
      website: customerData.website || `https://www.${customerData.customerName.toLowerCase().replace(/\s+/g, '')}.com`,
      customerContacts: customerData.customerContacts || [],
      internalContacts: customerData.internalContacts || [],
      products: customerData.products || [],
      partners: customerData.partners || [],
      sharePointUrl: customerData.sharePointUrl || `https://company.sharepoint.com/sites/opportunities/${customerData.customerName.toLowerCase().replace(/\s+/g, '-')}`,
      salesforceLink: customerData.salesforceLink || `https://company.lightning.force.com/lightning/r/Opportunity/${customerId}/view`,
      additionalLink: customerData.additionalLink || `https://loop.microsoft.com/loop/workspace/${customerData.customerName.toLowerCase().replace(/\s+/g, '-')}-notes`,
      additionalInfo: customerData.additionalInfo || `Additional information for ${customerData.customerName} - Strategic customer with focus on digital transformation and customer experience.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(customerRef, customerDoc, { merge: true });
    
    console.log(`✅ Successfully updated customer: ${customerData.customerName}`);
    console.log(`   Customer ID: ${customerId}`);
    console.log(`   Customer Contacts: ${customerContactIds.length}`);
    console.log(`   Internal Contacts: ${internalContactIds.length}`);
    console.log(`   Products: ${productIds.length}`);
    console.log(`   Partners: ${partnerIds.length}`);
    
  } catch (error) {
    console.error('❌ Error updating customer:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Check if singleCustomer.json exists
    const jsonPath = path.join(process.cwd(), 'singleCustomer.json');
    
    if (!fs.existsSync(jsonPath)) {
      console.log('❌ singleCustomer.json file not found!');
      console.log('\n📝 Please create a singleCustomer.json file with the following structure:');
      console.log(`
{
  "customerName": "Example Company",
  "website": "https://www.example.com",
  "customerContacts": [
    {
      "id": "contact-example",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "Project Manager"
    }
  ],
  "internalContacts": [
    {
      "id": "sc-example",
      "name": "Jane Smith",
      "role": "Account Executive",
      "email": "jane.smith@sitecore.com"
    }
  ],
  "products": [
    {
      "id": "product-xp",
      "name": "XP",
      "version": "10.3",
      "description": "Experience Platform",
      "status": "Active"
    }
  ],
  "partners": [
    {
      "id": "partner-example",
      "name": "Example Partner",
      "type": "Digital Agency",
      "website": "https://www.example-partner.com"
    }
  ],
  "additionalInfo": "Additional information about the customer"
}
      `);
      process.exit(1);
    }
    
    // Read and parse JSON file
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const customerData = JSON.parse(jsonData);
    
    // Validate required fields
    if (!customerData.customerName) {
      throw new Error('customerName is required');
    }
    
    // Update customer
    await updateCustomer(customerData);
    
    console.log('\n🎉 Customer update completed successfully!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateCustomer };