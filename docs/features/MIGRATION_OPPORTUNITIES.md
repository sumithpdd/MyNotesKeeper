# Migration Opportunities Guide

This guide explains how to use the Migration Opportunities feature in the Customer Engagement Hub.

## Overview

The Migration Opportunities feature allows you to:
- Upload CSV files containing migration opportunity data
- View all migration opportunities in a tabular grid format
- Filter and search migration opportunities
- Export migration opportunities to CSV

## CSV Format

Your CSV file should have the following columns (column names can include or exclude "?"):

### Required Columns:
- **Account Owner** (or "Account Owner?") - The internal contact name
- **Account Name** (or "Account Name?") - The customer name
- **xM or XP** (or "xM or XP?") - The product type (e.g., XP, XM)
- **Version** - The product version
- **Existing Migration Opp** (or "Existing Migration Opp?") - The migration opportunity flag (yes/no/YES/n/N)

### Optional Columns:
- **Perpetual or Subscription** - License type
- **Hosting Location** - Hosting details
- **Front End Tech** - Frontend technology
- **EXM User** - EXM usage (yes/no)
- **Marketing Automation User** - Marketing automation usage (yes/no)
- **Integrations** - Integration details
- **Heavily customised CE** - Customization level (yes/no)
- **Migration Complexity** - Complexity level
- **Customer aware of XMC** - XMC awareness (yes/no)
- **Compelling Event** - Compelling event details
- **Managed Cloud** - Managed cloud status (yes/no)
- **Date Analysed** - Analysis date
- **Notes** - Additional notes
- **Managing Partner** - Partner information

## Field Mapping

The script automatically maps CSV columns to the database fields and removes "?" from field names:

- `Account Owner?` → `accountOwner`
- `Account Name?` → `accountName`
- `xM or XP?` → `product`
- `Existing Migration Opp?` → `existingMigrationOpp`
- etc.

## Uploading Data

### Step 1: Prepare Your CSV File

Create a CSV file with the columns mentioned above. For example:

```csv
Account Owner,Account Name,xM or XP,Version,Existing Migration Opp,Notes,Managing Partner
Ibrahim Samy,Red Savannah Ltd,XP,10.2,yes,Potential upgrade,Great State
James Prince,Macmillan Cancer Support,XP,10.3,no,No interest,Inhouse
```

### Step 2: Upload the CSV

Run the upload script from the project root:

```bash
npx ts-node scripts/uploadMigrationOpportunities.ts "path/to/your/file.csv"
```

Or if you have a global TypeScript Node installation:

```bash
node scripts/uploadMigrationOpportunities.ts "path/to/your/file.csv"
```

### Step 3: Verify Upload

Check the Firebase Console to verify that the data was uploaded successfully:
- Go to https://console.firebase.google.com
- Navigate to Firestore Database
- Look for the `migrationOpportunities` collection

## Viewing Migration Opportunities

### In the UI

1. Open the Customer Engagement Hub
2. Click on the "Migration Opportunities" tab
3. You'll see a grid/table view of all migration opportunities

### Features

- **Search**: Search by account name, owner, product, or notes
- **Filter**: Filter by migration opportunity status (All, Active, No Opp)
- **Export**: Click "Export CSV" to download all filtered opportunities

### Grid Columns

The grid displays:
- Account Owner (Internal Contact)
- Account Name (Customer)
- Product (xM or XP)
- Version
- Migration Opp Flag (with colored badges)
- Migration Complexity
- Managing Partner
- Notes (truncated, hover to see full text)

## Data Model

### MigrationOpportunity Interface

```typescript
interface MigrationOpportunity {
  id: string;
  accountOwner: string;          // Internal Contact
  accountName: string;            // Customer
  product: string;                // xM or XP
  version: string;
  perpetualOrSubscription?: 'Perpetual' | 'Subscription' | 'Churn';
  hostingLocation?: string;
  frontEndTech?: string;
  exmUser?: 'yes' | 'no' | boolean;
  marketingAutomationUser?: 'yes' | 'no' | boolean;
  integrations?: string;
  heavilyCustomisedCE?: 'yes' | 'no' | boolean;
  migrationComplexity?: string;
  customerAwareOfXMC?: 'yes' | 'no' | 'Y' | 'N' | boolean;
  compellingEvent?: string;
  managedCloud?: 'yes' | 'no' | boolean;
  dateAnalysed?: string;
  existingMigrationOpp: 'yes' | 'no' | 'n' | 'N' | 'YES' | string;
  notes?: string;
  managingPartner?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Integration with Customers

When you upload migration opportunity data:
- The script automatically finds existing customers by name
- If a customer doesn't exist, it creates a new customer record
- Migration opportunities are stored separately in the `migrationOpportunities` collection

## Filtering Migration Opportunities

### By Migration Opp Status

Filter opportunities based on the "Existing Migration Opp" flag:

- **All Opportunities**: Shows all opportunities regardless of flag
- **Active Migration Opp**: Shows only opportunities where flag is "yes", "YES", or "y"
- **No Migration Opp**: Shows only opportunities where flag is "no", "n", or "N"

### By Search Term

Search across:
- Account Name (Customer)
- Account Owner (Internal Contact)
- Product (xM or XP)
- Notes

## Exporting Data

Click the "Export CSV" button to download all filtered opportunities as a CSV file. The exported file includes all fields and is suitable for importing into other tools or further analysis.

## Best Practices

1. **Data Cleanup**: Remove "?" from column headers before uploading (optional, the script handles both)
2. **Consistent Naming**: Use consistent customer names to avoid duplicate customer records
3. **Complete Data**: Fill in as many fields as possible for better filtering and analysis
4. **Regular Updates**: Update migration opportunities regularly to keep data current
5. **Export Backups**: Export data regularly for backup purposes

## Troubleshooting

### Import Fails

- Check that your CSV file path is correct
- Ensure all required columns are present
- Check the Firebase configuration in `.env.local`

### Data Not Showing in UI

- Refresh the page
- Check the browser console for errors
- Verify Firebase connection

### Incorrect Data Mapping

- Check column names match the expected format
- Ensure column order doesn't matter (the script uses column names, not positions)
- Verify special characters are properly escaped

## Support

For issues or questions, please refer to the main project README or contact the development team.


