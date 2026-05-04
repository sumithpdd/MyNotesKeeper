#!/usr/bin/env node
/**
 * Merge duplicate customers (e.g. Bristian/Bristan)
 * Keeps one record, merges notes/contacts/products, deletes the duplicate.
 *
 * Run: node scripts/mergeDuplicateCustomers.js "Bristian"
 * Or: node scripts/mergeDuplicateCustomers.js "Bristian" "Bristan"
 *
 * Requires: serviceAccountKey.json in project root
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

const targetName = process.argv[2];
const altName = process.argv[3];
if (!targetName) {
  console.error('Usage: node scripts/mergeDuplicateCustomers.js "DuplicateName" "PrimaryName"');
  process.exit(1);
}

let app;
try {
  const keyPath = path.join(__dirname, '../serviceAccountKey.json');
  if (!fs.existsSync(keyPath)) {
    console.error('❌ serviceAccountKey.json not found. Get it from Firebase Console → Service Accounts.');
    process.exit(1);
  }
  app = initializeApp({ credential: cert(require(keyPath)) });
} catch (e) {
  console.error('❌ Failed to init Firebase Admin:', e.message);
  process.exit(1);
}

const db = getFirestore(app);
db.settings({ ignoreUndefinedProperties: true });

function mergeArrays(a, b) {
  const seen = new Set();
  return [...(a || []), ...(b || [])].filter((id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function mergeStrings(a, b) {
  if (!a) return b || '';
  if (!b) return a;
  if (a.includes(b)) return a;
  if (b.includes(a)) return b;
  return `${a}\n\n[Merged] ${b}`;
}

async function main() {
  const all = await db.collection('customers').get();
  const targetLower = targetName.toLowerCase();
  const altLower = altName ? altName.toLowerCase() : null;
  const matches = all.docs.filter((d) => {
    const name = (d.data().customerName || '').toLowerCase();
    return name === targetLower || name.includes(targetLower) || targetLower.includes(name) ||
      (altLower && (name === altLower || name.includes(altLower) || altLower.includes(name)));
  });

  if (matches.length < 2) {
    console.log(`Found ${matches.length} record(s) for "${targetName}". Nothing to merge.`);
    return;
  }

  console.log(`Found ${matches.length} duplicates. Merging into first record.\n`);

  const [keep, ...toMerge] = matches;
  const keepData = keep.data();
  let merged = {
    ...keepData,
    customerName: keepData.customerName,
    productIds: keepData.productIds || [],
    customerContactIds: keepData.customerContactIds || [],
    internalContactIds: keepData.internalContactIds || [],
    accountExecutiveId: keepData.accountExecutiveId,
    accountExecutiveIds: keepData.accountExecutiveIds || [],
    partnerIds: keepData.partnerIds || [],
    mergedNotes: keepData.mergedNotes || '',
    migrationNotes: keepData.migrationNotes || '',
    additionalInfo: keepData.additionalInfo || '',
    updatedAt: Timestamp.now(),
    updatedBy: 'merge-script',
  };

  for (const doc of toMerge) {
    const d = doc.data();
    merged.productIds = mergeArrays(merged.productIds, d.productIds);
    merged.customerContactIds = mergeArrays(merged.customerContactIds, d.customerContactIds);
    merged.internalContactIds = mergeArrays(merged.internalContactIds, d.internalContactIds);
    merged.partnerIds = mergeArrays(merged.partnerIds, d.partnerIds);
    merged.accountExecutiveIds = mergeArrays(merged.accountExecutiveIds, d.accountExecutiveIds);
    if (d.accountExecutiveId && !merged.accountExecutiveIds.includes(d.accountExecutiveId)) {
      merged.accountExecutiveIds = [d.accountExecutiveId, ...merged.accountExecutiveIds];
    }
    merged.accountExecutiveId = merged.accountExecutiveIds[0] || merged.accountExecutiveId;
    merged.mergedNotes = mergeStrings(merged.mergedNotes, d.mergedNotes);
    merged.migrationNotes = mergeStrings(merged.migrationNotes, d.migrationNotes);
    merged.additionalInfo = mergeStrings(merged.additionalInfo, d.additionalInfo);
    if (d.website && !merged.website) merged.website = d.website;
    if (d.sharePointUrl && !merged.sharePointUrl) merged.sharePointUrl = d.sharePointUrl;
    if (d.salesforceLink && !merged.salesforceLink) merged.salesforceLink = d.salesforceLink;
  }

  await db.collection('customers').doc(keep.id).set(merged);
  console.log(`✅ Merged into: ${keep.id} (${keepData.customerName})`);

  for (const doc of toMerge) {
    await db.collection('customers').doc(doc.id).delete();
    console.log(`   Deleted duplicate: ${doc.id} (${doc.data().customerName})`);
  }

  // Update notes to point to kept customer
  const notesSnap = await db.collection('customerNotes').get();
  for (const noteDoc of notesSnap.docs) {
    const note = noteDoc.data();
    if (toMerge.some((d) => d.id === note.customerId)) {
      await db.collection('customerNotes').doc(noteDoc.id).update({
        customerId: keep.id,
        updatedAt: Timestamp.now(),
      });
      console.log(`   Reassigned note to kept customer`);
    }
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
