/**
 * Backup Script: Export Firestore Data
 * 
 * Creates a JSON backup of all Firestore collections
 * Run BEFORE migration: npx ts-node scripts/backupFirestore.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
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

async function backupCollection(collectionName: string): Promise<any[]> {
  const snapshot = await db.collection(collectionName).get();
  const data: any[] = [];
  
  snapshot.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return data;
}

async function runBackup() {
  console.log('═══════════════════════════════════════════════════');
  console.log('💾 STARTING FIRESTORE BACKUP');
  console.log('═══════════════════════════════════════════════════\n');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }
  
  const backupFile = path.join(backupDir, `firestore-backup-${timestamp}.json`);
  
  try {
    const backup: any = {
      timestamp: new Date().toISOString(),
      collections: {}
    };
    
    // Backup all collections
    const collections = ['customers', 'customerNotes', 'customerProfiles', 'opportunities', 'users'];
    
    for (const collectionName of collections) {
      console.log(`📦 Backing up ${collectionName}...`);
      backup.collections[collectionName] = await backupCollection(collectionName);
      console.log(`   ✅ ${backup.collections[collectionName].length} documents backed up`);
    }
    
    // Save to file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ BACKUP COMPLETE');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n💾 Backup saved to: ${backupFile}`);
    console.log(`📊 Total collections: ${collections.length}`);
    console.log(`📄 File size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB\n`);
    
  } catch (error) {
    console.error('\n❌ BACKUP FAILED:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run backup
runBackup();
