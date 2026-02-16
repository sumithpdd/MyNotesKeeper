# Migration Scripts

## Contact Normalization Migration

These scripts migrate customer data from embedded contacts to normalized references.

### Prerequisites

1. **Get Firebase Service Account Key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in project root
   - **Add to `.gitignore`** (security!)

2. **Install Dependencies:**
   ```bash
   npm install firebase-admin --save-dev
   npm install @types/node --save-dev
   ```

### Migration Process

#### Step 1: Backup (IMPORTANT!)
```bash
npx ts-node scripts/backupFirestore.ts
```
Creates: `backups/firestore-backup-{timestamp}.json`

#### Step 2: Run Migration
```bash
npx ts-node scripts/migrateContactsToReferences.ts
```

#### Step 3: Verify Consistency
```bash
npx ts-node scripts/dataConsistencyCheck.ts
```

### What the Migration Does

**Before:**
```json
customers/customer1 {
  "customerName": "Example Corp",
  "customerContacts": [
    { "id": "temp1", "name": "Jane Smith", "role": "Manager" }
  ],
  "internalContacts": [
    { "id": "temp2", "name": "John Doe", "email": "john@example.com" }
  ]
}
```

**After:**
```json
customerContacts/c1 {
  "name": "Jane Smith",
  "role": "Manager",
  "email": "",
  "createdAt": "..."
}

internalContacts/i1 {
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "..."
}

customers/customer1 {
  "customerName": "Example Corp",
  "customerContactIds": ["c1"],
  "internalContactIds": ["i1"],
  "customerContacts": [],
  "internalContacts": []
}
```

### Migration Features

- ✅ **Deduplication** - Same contact used by multiple customers creates only 1 document
- ✅ **Idempotent** - Safe to run multiple times (skips already migrated customers)
- ✅ **Detailed Logging** - See every step of the migration
- ✅ **Statistics** - Final report with counts and errors
- ✅ **Error Handling** - Continues on errors, reports at end

### Security Notes

- ⚠️ **NEVER commit `serviceAccountKey.json`** to Git
- ✅ Add to `.gitignore`:
  ```
  serviceAccountKey.json
  backups/
  ```

### Troubleshooting

**Error: "Cannot find module './serviceAccountKey.json'"**
- Download service account key from Firebase Console
- Place in project root as `serviceAccountKey.json`

**Error: "Permission denied"**
- Ensure service account has Firestore read/write permissions
- Check Firebase Console → IAM & Admin

**Migration stuck?**
- Check Firebase Console for any security rules blocking writes
- Ensure collections `customerContacts` and `internalContacts` are accessible

---

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for quick start and [NORMALIZATION_COMPLETE.md](NORMALIZATION_COMPLETE.md) for full details.
