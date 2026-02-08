#!/usr/bin/env node
"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMigrationOpportunity = uploadMigrationOpportunity;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
// Load environment variables
(0, dotenv_1.config)({ path: '.env.local' });
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
const app = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, firestore_1.getFirestore)(app);
// Helper function to generate ID from name
function generateId(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
// Helper function to normalize field names (remove ?)
function normalizeFieldName(fieldName) {
    return fieldName.replace(/\?/g, '').trim();
}
// Helper function to clean data
function cleanValue(value) {
    if (!value)
        return undefined;
    const cleaned = value.trim();
    if (cleaned === '-' || cleaned === '' || cleaned.toLowerCase() === 'n/a')
        return undefined;
    return cleaned;
}
// Helper function to convert yes/no to boolean
function convertYesNoToBoolean(value) {
    if (!value)
        return undefined;
    const lower = value.trim().toLowerCase();
    if (lower === 'yes' || lower === 'y')
        return 'yes';
    if (lower === 'no' || lower === 'n')
        return 'no';
    return undefined;
}
// Helper function to find existing customer by name
async function findCustomerByName(customerName) {
    try {
        const customersRef = (0, firestore_1.collection)(db, 'customers');
        const q = (0, firestore_1.query)(customersRef, (0, firestore_1.where)('customerName', '==', customerName));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        }
        return null;
    }
    catch (error) {
        console.error('Error finding customer:', error);
        return null;
    }
}
// Helper function to find or create customer
async function findOrCreateCustomer(customerName) {
    try {
        // Try to find existing customer
        const existingId = await findCustomerByName(customerName);
        if (existingId) {
            console.log(`Found existing customer: ${customerName}`);
            return existingId;
        }
        // Create new customer
        const customerId = generateId(customerName);
        const customerRef = (0, firestore_1.doc)(db, 'customers', customerId);
        await (0, firestore_1.setDoc)(customerRef, {
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
    }
    catch (error) {
        console.error('Error creating customer:', error);
        throw error;
    }
}
// Main function to upload migration opportunity
async function uploadMigrationOpportunity(row) {
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
        const managingPartner = cleanValue(row['Managing Partner']);
        console.log(`\n🚀 Processing: ${accountName}`);
        // Find or create customer
        const customerId = await findOrCreateCustomer(accountName);
        // Create migration opportunity data
        const migrationOppData = {
            id: generateId(`${accountName}-${version || 'unknown'}`),
            accountOwner: accountOwner || 'Unknown',
            accountName: accountName,
            product: product || 'Unknown',
            version: version || 'Unknown',
            perpetualOrSubscription: perpetualOrSubscription,
            hostingLocation,
            frontEndTech,
            exmUser,
            marketingAutomationUser,
            integrations,
            heavilyCustomisedCE,
            migrationComplexity,
            customerAwareOfXMC,
            compellingEvent,
            managedCloud,
            dateAnalysed,
            existingMigrationOpp: existingMigrationOpp || 'no',
            notes,
            managingPartner,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        // Save to Firestore
        const oppRef = (0, firestore_1.doc)(db, 'migrationOpportunities', migrationOppData.id);
        await (0, firestore_1.setDoc)(oppRef, migrationOppData);
        console.log(`✅ Uploaded migration opportunity for: ${accountName}`);
    }
    catch (error) {
        console.error('❌ Error uploading migration opportunity:', error);
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
        if (!fs_1.default.existsSync(csvFilePath)) {
            console.log(`❌ CSV file not found: ${csvFilePath}`);
            process.exit(1);
        }
        console.log('🌱 Starting migration opportunity upload...');
        console.log(`📄 Reading CSV file: ${csvFilePath}`);
        // Read and parse CSV
        const csvContent = fs_1.default.readFileSync(csvFilePath, 'utf-8');
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
        const filteredHeaders = [];
        const headerIndices = [];
        headers.forEach((header, index) => {
            if (header && header !== '') {
                filteredHeaders.push(header);
                headerIndices.push(index);
            }
        });
        console.log(`📊 Found headers (${filteredHeaders.length}): ${filteredHeaders.join(', ')}`);
        const rows = [];
        for (let i = headerLineIndex + 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
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
        // Upload each migration opportunity
        let successCount = 0;
        let errorCount = 0;
        for (const row of rows) {
            try {
                await uploadMigrationOpportunity(row);
                successCount++;
            }
            catch (error) {
                console.error('❌ Error processing row:', row);
                errorCount++;
            }
        }
        console.log('\n🎉 Migration opportunity upload completed!');
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`📊 Total: ${rows.length}`);
    }
    catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}
// Run the script
if (require.main === module) {
    main();
}
