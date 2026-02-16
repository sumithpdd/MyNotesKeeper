# API Routes Guide

All API endpoints follow REST conventions with JSON responses.

## Base Response Format
```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  created?: boolean; // Only for defensive create fallbacks
}
```

---

## Customers API

### `GET /api/customers`
Get all customers.

**Response:**
```json
{
  "success": true,
  "data": [{ "id": "...", "customerName": "...", ... }]
}
```

### `POST /api/customers`
Create a new customer.

**Request:**
```json
{
  "customer": { "customerName": "ABC Corp", ... },
  "userId": "user123"
}
```

### `PUT /api/customers`
Update a customer. Auto-creates if doesn't exist (defensive).

**Request:**
```json
{
  "customerId": "cust123",
  "customer": { ... },
  "userId": "user123"
}
```

### `DELETE /api/customers?id={customerId}`
Delete a customer.

---

## Notes API

### `GET /api/notes?customerId={id}`
Get all notes or notes for a specific customer.

### `POST /api/notes`
Create a new note.

**Request:**
```json
{
  "note": { "customerId": "...", "notes": "...", ... },
  "userId": "user123"
}
```

### `PUT /api/notes`
Update a note. Auto-creates if doesn't exist (defensive).

### `DELETE /api/notes?id={noteId}`
Delete a note.

---

## Opportunities API

### `GET /api/opportunities`
- `?id={opportunityId}` - Get single opportunity
- `?customerId={id}` - Get all opportunities for customer
- No params - Get all opportunities

### `POST /api/opportunities`
Create a new opportunity.

**Request:**
```json
{
  "opportunity": {
    "customerId": "...",
    "opportunityName": "...",
    "currentStage": "Prospect",
    ...
  }
}
```

### `PUT /api/opportunities`
Update an opportunity.

### `DELETE /api/opportunities`
- `?id={opportunityId}` - Delete single opportunity
- `?customerId={id}` - Delete all opportunities for customer

### `POST /api/opportunities/stage`
Change opportunity stage with history tracking.

**Request:**
```json
{
  "opportunityId": "opp123",
  "newStage": "Qualify",
  "userEmail": "user@example.com",
  "notes": "Met with stakeholders"
}
```

---

## Contacts API

### `GET /api/contacts?type={customer|internal}`
Get contacts (Firebase integration pending).

### `POST /api/contacts`
Create a contact.

**Request:**
```json
{
  "contact": { "id": "...", "name": "...", "email": "...", ... },
  "type": "customer" // or "internal"
}
```

### `PUT /api/contacts`
Update a contact.

### `DELETE /api/contacts?id={contactId}&type={customer|internal}`
Delete a contact.

---

## Entities API (Products & Partners)

### `GET /api/entities?type={products|partners}`
Get products or partners (Firebase integration pending).

### `POST /api/entities`
Create a product or partner.

**Request:**
```json
{
  "entity": { "id": "...", "name": "...", ... },
  "type": "product" // or "partner"
}
```

### `PUT /api/entities`
Update an entity.

### `DELETE /api/entities?id={entityId}&type={product|partner}`
Delete an entity.

---

## Error Handling

All errors return:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Status codes:
- `200` - Success
- `400` - Bad request (missing parameters)
- `404` - Not found
- `500` - Server error

---

## Defensive Patterns

APIs include defensive error handling:
- **Update → Create fallback**: If updating a non-existent document, automatically creates it
- **Detailed logging**: All errors logged to console
- **Graceful degradation**: Returns helpful error messages

---

## Usage Example

```typescript
// Create a customer
const response = await fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: { customerName: 'ABC Corp', ... },
    userId: user.id
  })
});

const result = await response.json();
if (result.success) {
  console.log('Created:', result.data);
}
```
