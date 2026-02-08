# Database Scripts

This directory contains scripts for managing the Firebase database with real customer data.

## Scripts Overview

### 1. `seedDatabase.ts` / `seedDatabase.js`
**Purpose**: Seeds the entire Firebase database with real customer data from CSV files and dummy data.

**Usage**:
```bash
# TypeScript version
npx tsx scripts/seedDatabase.ts

# JavaScript version
node scripts/seedDatabase.js
```

**What it does**:
- Creates all Firebase collections (customers, customerContacts, internalContacts, products, partners, customerNotes, customerProfiles)
- Populates with real data from CSV files (26 real customers)
- Adds dummy data for testing
- Provides progress indicators and summary

**Collections created**:
- `products`: Real Sitecore products (XP versions 9.0.1-10.3) + additional products
- `customerContacts`: Real customer contacts from CSV + dummy contacts
- `internalContacts`: Real Sitecore team members + dummy contacts
- `partners`: Real partners from CSV + dummy partners
- `customers`: 26 real customers from CSV + dummy customers
- `customerNotes`: Generated notes for all customers
- `customerProfiles`: Generated profiles for all customers

### 2. `singleCustomerUpdate.ts` / `singleCustomerUpdate.js`
**Purpose**: Updates a single customer in the database using a JSON file.

**Usage**:
```bash
# TypeScript version
npx tsx scripts/singleCustomerUpdate.ts

# JavaScript version
node scripts/singleCustomerUpdate.js
```

**What it does**:
- Reads customer data from `singleCustomer.json`
- Creates or updates the customer
- Creates/updates customer contacts, internal contacts, products, and partners
- Handles duplicate detection (finds existing by email/name)
- Provides detailed logging

**Required file**: `singleCustomer.json` (see example below)

## Data Sources

### Real Customer Data
The real customer data comes from CSV files:
- `data/Customer Enagement 18c63f24b17c802d93d6e5af55ba88c3_all.csv`
- `data/Customer Enagement 18c63f24b17c802d93d6e5af55ba88c3.csv`

**Real Customers Include**:
- Barclays, Marley, Uk Sports Council, CAPCO, NHSP, Loma
- Taylor and Wimpy, Jackson Fencing, TheMyersBriggs, RCSI
- University of Leicester, Bristan, R & A, MacMillan, BUPA
- Londons and Partners, ASOS, DLL, D-Link, JRE, Next
- Greene King, The FA, Bloor Homes, FieldFisher, Brother

**Real Internal Contacts**:
- Daniella Militaru (SE)
- Ibrahim Samy (Account Executive)
- Steve Little (Director SE UK and I)
- James Prince (Account Executive)
- Paul Coombs (Account Executive)
- Tim Eijpe (Account Executive - Enterprise)
- Diemen Ysewyn (Account Executive)

**Real Partners**:
- Coforge, HugoMRM, Graph Digital, RatioPartners
- DEPT, Appius, Valtech, Sagittarius, iGoDigital
- TEC Software Solutions, Ethisys, VML, IDHL, xCentium

**Real Products**:
- Sitecore XP versions: 9.0.1, 9.2, 9.3, 10.1, 10.2, 10.3

## Example singleCustomer.json

```json
{
  "customerName": "Example Company",
  "website": "https://www.example.com",
  "customerContacts": [
    {
      "id": "contact-example-1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "Project Manager",
      "phone": "+1-555-0123"
    }
  ],
  "internalContacts": [
    {
      "id": "sc-example-1",
      "name": "Ibrahim Samy",
      "role": "Account Executive",
      "email": "ibrahim.samy@sitecore.com"
    }
  ],
  "products": [
    {
      "id": "product-xp-example",
      "name": "XP",
      "version": "10.3",
      "description": "Experience Platform",
      "status": "Active"
    }
  ],
  "partners": [
    {
      "id": "partner-example-1",
      "name": "DEPT",
      "type": "Digital Agency",
      "website": "https://www.deptagency.com"
    }
  ],
  "additionalInfo": "Additional information about the customer"
}
```

## Prerequisites

1. **Firebase Configuration**: Make sure `.env.local` is configured with Firebase credentials
2. **Dependencies**: Install required packages:
   ```bash
   npm install firebase dotenv
   npm install -D tsx  # For TypeScript execution
   ```

## Environment Variables Required

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Error Handling

Both scripts include comprehensive error handling:
- Firebase connection errors
- Missing environment variables
- Invalid JSON data
- Duplicate detection
- Progress tracking

## Output

The scripts provide detailed console output:
- Progress indicators for large operations
- Success/failure messages
- Summary statistics
- Error details with context

## Security Notes

- Scripts use Firebase security rules (make sure they're configured)
- Environment variables are loaded securely
- No sensitive data is logged to console
- All operations are logged for audit purposes
