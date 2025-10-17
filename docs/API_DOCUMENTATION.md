# API Documentation

## Overview
The Customer Engagement Hub provides a comprehensive API for managing customer data, notes, and AI-powered content generation. The API is built on Next.js with Firebase integration and Google Gemini AI.

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication
The application uses Firebase Authentication for user management. Include the Firebase token in the Authorization header:

```http
Authorization: Bearer <firebase-token>
```

## Data Models

### Customer
```typescript
interface Customer {
  id: string;
  customerName: string;
  website?: string;
  products: Product[];
  customerContacts: CustomerContact[];
  internalContacts: InternalContact[];
  partners: Partner[];
  sharePointUrl: string;
  salesforceLink: string;
  additionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Customer Note
```typescript
interface CustomerNote {
  id: string;
  customerId: string;
  notes: string;
  noteDate: Date;
  createdBy: string;
  updatedBy: string;
  businessProblem: string;
  whyUs: string;
  whyNow: string;
  techSelect: boolean;
  preDiscovery: boolean;
  discovery: string;
  discoveryNotesAttached: boolean;
  totalDemos: number;
  latestDemoDryRun: boolean;
  latestDemoDate: Date;
  techDeepDive: string;
  infoSecCompleted: boolean;
  knownTechnicalRisks: string;
  mitigationPlan: string;
  seConfidence: 'Green' | 'Yellow' | 'Red' | '';
  seNotes: string;
  seInvolvement: boolean;
  seNotesLastUpdated: Date;
  seProductFitAssessment: 'Green' | 'Yellow' | 'Red' | '';
  customerObjectives: string[];
  customerObjectivesDetails: string;
  customerUseCases: string[];
  otherFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

## Customer Management API

### Get All Customers
```http
GET /api/customers
```

**Response:**
```json
{
  "customers": [
    {
      "id": "customer-1",
      "customerName": "Example Customer",
      "website": "https://www.example.com",
      "products": [
        {
          "id": "product-1",
          "name": "XM",
          "version": "10.3",
          "status": "Active"
        }
      ],
      "customerContacts": [
        {
          "id": "contact-1",
          "name": "John Smith",
          "email": "john.smith@example.com",
          "role": "CTO"
        }
      ],
      "internalContacts": [
        {
          "id": "internal-1",
          "name": "Account Manager",
          "role": "Account Executive",
          "email": "account.manager@company.com"
        }
      ],
      "partners": [
        {
          "id": "partner-1",
          "name": "Implementation Partner",
          "type": "Implementation Partner",
          "website": "https://www.partner.com"
        }
      ],
      "sharePointUrl": "https://company.sharepoint.com/sites/opportunities/example-customer",
      "salesforceLink": "https://company.lightning.force.com/lightning/r/Opportunity/100000000000000/view",
      "additionalInfo": "Strategic customer with focus on digital transformation",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-12-01T00:00:00Z"
    }
  ],
  "total": 33,
  "page": 1,
  "limit": 10
}
```

### Get Customer by ID
```http
GET /api/customers/{id}
```

**Response:**
```json
{
  "customer": {
    "id": "customer-1",
    "customerName": "customer 1",
    // ... full customer object
  }
}
```

### Create Customer
```http
POST /api/customers
Content-Type: application/json

{
  "customerName": "New Customer",
  "website": "https://www.example.com",
  "products": [
    {
      "name": "XM Cloud",
      "version": "1.0",
      "status": "Active"
    }
  ],
  "customerContacts": [
    {
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "Marketing Director"
    }
  ],
  "internalContacts": [
    {
      "name": "Account Manager",
      "role": "Account Executive",
      "email": "account.manager@company.com"
    }
  ],
  "partners": [],
  "sharePointUrl": "https://company.sharepoint.com/sites/opportunities/example-customer",
  "salesforceLink": "https://company.lightning.force.com/lightning/r/Opportunity/200000000000000/view",
  "additionalInfo": "New customer onboarding"
}
```

**Response:**
```json
{
  "customer": {
    "id": "customer-34",
    "customerName": "New Customer",
    // ... full customer object with generated ID and timestamps
  }
}
```

### Update Customer
```http
PUT /api/customers/{id}
Content-Type: application/json

{
  "customerName": "Updated Customer Name",
  "website": "https://www.updatedcustomer.com",
  // ... other fields to update
}
```

**Response:**
```json
{
  "customer": {
    "id": "customer-1",
    "customerName": "Updated Customer Name",
    // ... updated customer object
  }
}
```

### Delete Customer
```http
DELETE /api/customers/{id}
```

**Response:**
```json
{
  "message": "Customer deleted successfully",
  "deletedId": "customer-1"
}
```

## Notes Management API

### Get Customer Notes
```http
GET /api/customers/{customerId}/notes
```

**Response:**
```json
{
  "notes": [
    {
      "id": "note-1",
      "customerId": "customer-1",
      "notes": "Initial meeting to discuss implementation...",
      "noteDate": "2024-11-01T00:00:00Z",
      "createdBy": "AE",
      "updatedBy": "AE",
      "businessProblem": "Legacy CMS limitations affecting content delivery",
      "whyUs": "Advanced personalization engine and comprehensive platform capabilities",
      "whyNow": "Current system reaching end-of-life, need for better customer experience",
      "techSelect": true,
      "seConfidence": "Green",
      "seInvolvement": true,
      "seProductFitAssessment": "Green",
      "customerObjectives": [
        "Improve content personalization",
        "Enhance customer experience"
      ],
      "customerUseCases": [
        "Multi-language content management",
        "Personalized user journeys"
      ],
      "createdAt": "2024-11-01T00:00:00Z",
      "updatedAt": "2024-11-01T00:00:00Z"
    }
  ],
  "total": 5
}
```

### Create Note
```http
POST /api/customers/{customerId}/notes
Content-Type: application/json

{
  "notes": "Meeting notes content...",
  "noteDate": "2024-12-01T00:00:00Z",
  "createdBy": "AE",
  "businessProblem": "Need for better content management",
  "whyUs": "Best-in-class platform capabilities",
  "whyNow": "Digital transformation initiative",
  "techSelect": true,
  "preDiscovery": true,
  "discovery": "Yes",
  "discoveryNotesAttached": true,
  "totalDemos": 2,
  "latestDemoDryRun": false,
  "latestDemoDate": "2024-11-15T00:00:00Z",
  "techDeepDive": "Scheduled",
  "infoSecCompleted": false,
  "knownTechnicalRisks": "Data privacy compliance requirements",
  "mitigationPlan": "Working with legal team on data handling procedures",
  "seConfidence": "Green",
  "seInvolvement": true,
  "seProductFitAssessment": "Green",
  "customerObjectives": [
    "Improve operational efficiency",
    "Enhance customer engagement"
  ],
  "customerObjectivesDetails": "Focus on reducing operational costs through automation",
  "customerUseCases": [
    "Content personalization",
    "Multi-channel delivery"
  ]
}
```

**Response:**
```json
{
  "note": {
    "id": "note-6",
    "customerId": "customer-1",
    // ... full note object with generated ID and timestamps
  }
}
```

### Update Note
```http
PUT /api/notes/{noteId}
Content-Type: application/json

{
  "notes": "Updated meeting notes content...",
  "updatedBy": "DM",
  "seConfidence": "Yellow",
  // ... other fields to update
}
```

### Delete Note
```http
DELETE /api/notes/{noteId}
```

**Response:**
```json
{
  "message": "Note deleted successfully",
  "deletedId": "note-1"
}
```

## AI Integration API

### Generate SE Notes
```http
POST /api/ai/generate-se-notes
Content-Type: application/json

{
  "customerName": "Example Customer",
  "businessProblem": "Legacy CMS limitations",
  "whyUs": "Advanced personalization capabilities",
  "whyNow": "Digital transformation initiative",
  "techSelect": true,
  "preDiscovery": true,
  "discovery": "Yes",
  "totalDemos": 3,
  "seConfidence": "Green",
  "seInvolvement": true
}
```

**Response:**
```json
{
  "seNotes": "Initial Details:\n• What business problem are we solving? Legacy CMS limitations\n• Why Us? Advanced personalization capabilities\n• Why now? Digital transformation initiative\n• Tech select (y/n) Yes\n\nQuick Hit Details:\n• Pre-discovery (y/n) Yes\n• Discovery (y/n) Yes\n• Total number of demos to date 3\n• SE Confidence: Green\n• SE Involvement: Yes\n\nActivity Details:\n• Generated content based on provided information"
}
```

### Generate Customer Objectives
```http
POST /api/ai/generate-objectives
Content-Type: application/json

{
  "customerName": "Example Customer",
  "industry": "Financial Services",
  "currentChallenges": [
    "Legacy systems",
    "Poor customer experience",
    "Limited personalization"
  ]
}
```

**Response:**
```json
{
  "objectives": [
    "Modernize digital infrastructure",
    "Improve customer experience",
    "Implement advanced personalization",
    "Reduce operational costs",
    "Enhance security and compliance"
  ]
}
```

### Generate Use Cases
```http
POST /api/ai/generate-use-cases
Content-Type: application/json

{
  "customerName": "Example Customer",
  "industry": "Financial Services",
  "products": ["XM", "XM Cloud"],
  "objectives": [
    "Improve customer experience",
    "Implement personalization"
  ]
}
```

**Response:**
```json
{
  "useCases": [
    "Personalized banking experiences",
    "Multi-channel content delivery",
    "Dynamic product recommendations",
    "Targeted marketing campaigns",
    "Compliance content management"
  ]
}
```

## Search and Filter API

### Search Customers
```http
GET /api/customers/search?q={query}&sort={field}&order={asc|desc}&page={page}&limit={limit}
```

**Parameters:**
- `q` - Search query (searches name, contacts, partners)
- `sort` - Sort field (name, createdAt, products)
- `order` - Sort order (asc, desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```http
GET /api/customers/search?q=example&sort=name&order=asc&page=1&limit=10
```

**Response:**
```json
{
  "customers": [
    {
      "id": "customer-1",
      "customerName": "Example Customer",
      // ... customer object
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "query": "example"
}
```

### Filter by Products
```http
GET /api/customers/filter?products=XM,XM Cloud&status=Active
```

**Response:**
```json
{
  "customers": [
    // ... customers with XM or XM Cloud products
  ],
  "filters": {
    "products": ["XM", "XM Cloud"],
    "status": "Active"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request data",
  "details": {
    "field": "customerName",
    "issue": "Customer name is required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Customer not found",
  "id": "customer-999"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "requestId": "req-123456"
}
```

## Rate Limiting
- **Customer API**: 100 requests per minute
- **Notes API**: 200 requests per minute
- **AI API**: 50 requests per minute

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Customer Updated
```http
POST /webhooks/customer-updated
Content-Type: application/json
X-Webhook-Signature: sha256=...

{
  "event": "customer.updated",
  "data": {
    "customer": {
      // ... customer object
    },
    "changes": {
      "customerName": {
        "old": "Old Name",
        "new": "New Name"
      }
    }
  },
  "timestamp": "2024-12-01T00:00:00Z"
}
```

### Note Created
```http
POST /webhooks/note-created
Content-Type: application/json
X-Webhook-Signature: sha256=...

{
  "event": "note.created",
  "data": {
    "note": {
      // ... note object
    },
    "customer": {
      // ... customer object
    }
  },
  "timestamp": "2024-12-01T00:00:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
import { CustomerAPI } from './customer-api';

const api = new CustomerAPI({
  baseURL: 'https://api.yourdomain.com',
  apiKey: 'your-api-key'
});

// Get all customers
const customers = await api.customers.getAll();

// Create a new customer
const newCustomer = await api.customers.create({
  customerName: 'New Customer',
  website: 'https://www.newcustomer.com',
  // ... other fields
});

// Get customer notes
const notes = await api.customers.getNotes('customer-1');

// Generate AI content
const seNotes = await api.ai.generateSENotes({
  customerName: 'Example Customer',
  businessProblem: 'Legacy CMS limitations',
  // ... other fields
});
```

### Python
```python
import requests

class CustomerAPI:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def get_customers(self):
        response = requests.get(
            f'{self.base_url}/api/customers',
            headers=self.headers
        )
        return response.json()
    
    def create_customer(self, customer_data):
        response = requests.post(
            f'{self.base_url}/api/customers',
            json=customer_data,
            headers=self.headers
        )
        return response.json()

# Usage
api = CustomerAPI('https://api.yourdomain.com', 'your-api-key')
customers = api.get_customers()
```

## Testing

### Postman Collection
Import the provided Postman collection to test all API endpoints:
- `Customer Engagement Hub API.postman_collection.json`

### cURL Examples
```bash
# Get all customers
curl -X GET "https://api.yourdomain.com/api/customers" \
  -H "Authorization: Bearer your-token"

# Create customer
curl -X POST "https://api.yourdomain.com/api/customers" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "website": "https://www.testcustomer.com"
  }'

# Generate AI content
curl -X POST "https://api.yourdomain.com/api/ai/generate-se-notes" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Example Customer",
    "businessProblem": "Test problem"
  }'
```
