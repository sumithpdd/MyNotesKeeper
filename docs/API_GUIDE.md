# API Routes Guide

All API endpoints follow REST conventions with JSON responses.

## Authentication (Firebase Admin — required)

Hub data APIs do **not** talk to Firestore anonymously. The server **must** have **`FIREBASE_SERVICE_ACCOUNT_JSON`** set ([SETUP.md](SETUP.md), [SECURITY.md](SECURITY.md)). If it is missing, handlers that use **`authorizeApiRequest`** return **503** with a message to configure the service account.

When Admin is configured, callers **must** send:

```http
Authorization: Bearer <Firebase ID token>
```

Obtain the token from the Firebase client after sign-in (e.g. `await auth.currentUser.getIdToken()`), or equivalent in scripts.

**Endpoints (non-exhaustive)** using this pattern:

- **`GET /api/workspace`** — Primary hub snapshot (Admin Firestore; customers = **full shared roster** unless **`HUB_WORKSPACE_CUSTOMER_SCOPE=mine`** on the server — see SETUP.md)
- **`POST /api/auth/bootstrap`** — Signed-in user bootstrap
- **`/api/customers`**, **`/api/notes`**, **`/api/contacts`**, **`/api/entities`**, **`/api/opportunities`**, **`/api/opportunities/stage`**
- **`/api/tasks`**, **`POST /api/task-categories`**, **`PATCH /api/customer-profiles`**
- **`/api/martech`** — Martech catalogue CRUD
- **`POST /api/ai-chat`**, **`POST /api/ai-command`**

**`userId` in JSON body:** For mutations that accept it (**customers**, **notes**, **customer-profiles**, **`ai-command`**, etc.), the body **`userId` must equal the token’s Firebase `uid`**, otherwise **403**.

**`POST /api/ai-chat`:** Send **`{ "message": "<text>" }` only**. Do **not** rely on a client-supplied `userId`; tool actions (notes, creates, updates) use the **`uid` from the verified Bearer token**, so impersonation via body fields is impossible.

---

## Workspace API

### `GET /api/workspace`

Returns the engagement hub as one JSON snapshot: customers, notes, profiles, opportunities, catalogue entities (products, partners, martech), referenced contacts, tasks, and task categories.

**Customers:** Includes **every** Firestore **`customers`** document by default (**shared team** view). Server env **`HUB_WORKSPACE_CUSTOMER_SCOPE=mine`** limits customers to **`createdBy`** matching your token **`uid`** or **email**.

The server aggregates in `src/lib/server/workspaceLoad.ts`.

**Headers:** `Authorization: Bearer <Firebase ID token>`

**Response:** `{ "success": true, "data": { … } }` — the SPA hydrates ISO dates in `src/lib/client/workspaceHydrate.ts`.

---

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
Get contacts from Firestore-backed collections (`customerContacts` / `internalContacts`).

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
Get products or partners from Firestore.

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

## AI Chat API (Natural Language Interface)

### `GET /api/ai-chat`
Returns API info and available tools.

**Response:**
```json
{
  "message": "AI Chat API - LLM + Tools",
  "version": "1.0.0",
  "usage": "POST with Authorization: Bearer …; body { \"message\": string }; tool actions use authenticated uid",
  "tools": ["lookup_customer", "update_customer", "add_note", "search_customers", ...]
}
```

### `POST /api/ai-chat`
Natural language interface for customer data. The AI uses tools to read/update data.

**Headers:** `Authorization: Bearer <Firebase ID token>`

**Request:**
```json
{
  "message": "List open tasks for ACME Corp"
}
```

**Example prompts:**
- "List [AE name]'s accounts" / "Show customers for [AE name]"
- "Update [customer] notes to: [content]"
- "Assign [AE name] to [customer]"
- "Add a note for [customer]: [note content]"
- "Search customers by account executive [AE name]"

**Response:**
```json
{
  "success": true,
  "text": "[AE name] has X accounts: [customer1], [customer2], ..."
}
```

**Tools used internally:** `lookup_customer`, `update_customer`, `add_note`, `search_customers`, `list_customers`, `list_internal_contacts`, `create_internal_contact`, etc.

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

- **`200`** — Success
- **`400`** — Bad request (missing or invalid parameters)
- **`401`** — Unauthorized (Bearer missing or invalid)
- **`403`** — Forbidden (e.g. `userId` in body does not match verified token on routes that enforce it)
- **`404`** — Not found (where applicable)
- **`503`** — Service unavailable (Firebase Admin not configured: missing **`FIREBASE_SERVICE_ACCOUNT_JSON`**)
- **`500`** — Server error

---

## Defensive Patterns

APIs include defensive error handling:
- **Update → Create fallback**: If updating a non-existent document, automatically creates it
- **Detailed logging**: All errors logged to console
- **Graceful degradation**: Returns helpful error messages

---

## Usage example (with Bearer token)

```typescript
const idToken = await auth.currentUser?.getIdToken();
if (!idToken) throw new Error('Sign in required');

const response = await fetch('/api/customers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
  },
  body: JSON.stringify({
    customer: { customerName: 'ABC Corp', /* … */ },
    userId: auth.currentUser.uid,
  }),
});
```
