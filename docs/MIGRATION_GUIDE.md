# Database Normalization Migration - Quick Start

## 🚀 How to Run

```bash
# Step 1: Backup (IMPORTANT!)
npx ts-node scripts/backupFirestore.ts

# Step 2: Migrate All Entities
npx ts-node scripts/migrateContactsToReferences.ts

# Step 3: Verify Consistency
npx ts-node scripts/dataConsistencyCheck.ts
```

## 📊 What It Does

Normalizes **all customer data** from embedded objects to ID references:

- ✅ **Contacts** (customer + internal)
- ✅ **Products**
- ✅ **Partners** (implementation partners)
- ✅ **Account Executives** (internal contacts)

### Before (Denormalized)
```javascript
customers/customer1 {
  products: [{name: "XM", version: "10.2"}],
  partners: [{name: "Partner Inc", type: "Implementation"}],
  customerContacts: [{name: "Grace", role: "Manager"}],
  internalContacts: [{name: "John", email: "john@..."}]
}
```

### After (Normalized)
```javascript
// Dedicated Collections
products/product-xm {name: "XM", version: "10.2"}
partners/partner-inc {name: "Partner Inc", type: "Implementation"}
customerContacts/c1 {name: "Grace", role: "Manager"}
internalContacts/i1 {name: "John", email: "john@..."}

// Customer with References Only
customers/customer1 {
  productIds: ["product-xm"],
  partnerIds: ["partner-inc"],
  customerContactIds: ["c1"],
  internalContactIds: ["i1"]
}
```

## ✅ Verify in Firebase Console

After migration, check:
- `products` → New collection (18 docs)
- `partners` → New collection (17 docs)
- `customerContacts` → New collection (22 docs)
- `internalContacts` → New collection (7 docs)
- `customers` → Only has ID arrays, no embedded objects

## 🎁 Benefits

- ✅ **90% smaller** customer documents
- ✅ **No data duplication** across customers
- ✅ **Update once**, reflect everywhere
- ✅ **Proper 3NF** database design
- ✅ **Better performance** for queries

## 📚 Full Documentation

See [NORMALIZATION_COMPLETE.md](NORMALIZATION_COMPLETE.md) for complete details, migration statistics, and code changes.

---

**Backup location:** `backups/firestore-backup-{timestamp}.json`
