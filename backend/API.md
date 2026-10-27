# CST Café API – contract between frontend and backend

This file is the **agreement** between the two halves of the project.
If the backend changes a URL, a field name or a response shape, update this file **in the same pull request**
and tell the frontend developer.

- Base URL (local): `http://localhost:4000`
- The frontend never calls this address from the browser. The browser calls `/api/...` on the website,
  and `frontend/next.config.mjs` forwards it here. Server pages call it directly using `BACKEND_URL`.
- All bodies are JSON. Money is in Ngultrum (Nu.) as plain numbers. Dates are ISO strings (UTC).
- Errors always look like: `{ "error": "Human readable message", "fields": { "fieldName": "message" } }`
  (`fields` only on validation errors).

| Status | Meaning |
|---|---|
| 200 / 201 | OK / created |
| 400 | invalid input (see `fields`) |
| 401 | not logged in (admin routes) |
| 403 | blocked cross-site request |
| 404 | not found |
| 409 | not allowed right now (sold out, wrong status order, ordering paused…) |
| 429 | too many failed logins |
| 503 | database unreachable |

## Values used everywhere

| Field | Values |
|---|---|
| `orderType` | `TAKEAWAY`, `DINE_IN` |
| `orderStatus` | `RECEIVED` → `PREPARING` → `READY` → `COMPLETED`, or `CANCELLED` |
| `paymentStatus` | `UNPAID`, `PAID` |
| `paymentMethod` | `CASH_AT_COUNTER` |
| `orderId` | `CST-YYYYMMDD-NNN`, e.g. `CST-20261027-004` |

(These are also in `src/lib/constants.js` on both sides – keep them identical.)

---

## Public (no login)

### `GET /api/health`
`{ "status": "ok", "time": "…" }`

### `GET /api/menu`
Active categories and their active items (sold-out items included, with `isAvailable: false`).
```json
{
  "categories": [{ "id": "…", "name": "Snacks", "slug": "snacks", "icon": "🥟", "sortOrder": 2, "isActive": true }],
  "items": [{
    "id": "…", "name": "Veg Momo (10 pcs)", "description": "…", "price": 80, "image": "",
    "isAvailable": true, "isActive": true, "isFeatured": true, "categoryId": "…",
    "createdAt": "…", "updatedAt": "…"
  }]
}
```

### `GET /api/settings`
```json
{
  "cafeName": "CST Café", "phone": "+975 …", "email": "…", "location": "…",
  "openingHours": "Mon–Sat · 7:30 AM – 8:00 PM\nSunday · …",
  "acceptingOrders": true, "tableCount": 20,
  "takeawayCharge": 0, "takeawayChargeLabel": "Takeaway packaging"
}
```

### `POST /api/orders` – place an order
Request:
```json
{
  "customerName": "Karma Dorji",
  "customerPhone": "17123456",
  "orderType": "DINE_IN",
  "tableNumber": 7,
  "specialInstructions": "Less chilli",
  "items": [{ "menuItemId": "…", "quantity": 2 }],
  "idempotencyKey": "random-16-to-64-chars"
}
```
- `customerPhone`, `specialInstructions` optional. `tableNumber` required only for `DINE_IN`.
- `quantity` 1–20. `idempotencyKey` must be new for each checkout; sending the same key again returns the same order.
- Anything else (prices, totals, statuses) is ignored – the server prices the order from the database.

Response `201` (or `200` with `duplicate: true` for a repeated key):
```json
{ "orderId": "CST-20261027-004", "accessToken": "secret-for-the-receipt", "totalAmount": 250, "duplicate": false }
```
Errors: `400` validation, `409` item sold out / removed (`unavailable: [{ menuItemId, name, reason }]`) or ordering paused.

### `GET /api/orders/:orderId?token=…`
- With the correct `token` → `{ "access": "full", "order": Receipt }`
- Without it → `{ "access": "public", "order": PublicStatus }`
- `404` if not found.

**Receipt**
```json
{
  "orderId": "…", "customerName": "Karma Dorji", "customerPhone": "17123456",
  "orderType": "DINE_IN", "tableNumber": 7, "specialInstructions": "",
  "items": [{ "menuItemId": "…", "name": "Veg Momo (10 pcs)", "unitPrice": 80, "quantity": 2, "lineTotal": 160 }],
  "subtotal": 160, "charges": [], "additionalCharges": 0, "totalAmount": 160,
  "paymentMethod": "CASH_AT_COUNTER", "paymentStatus": "UNPAID", "orderStatus": "RECEIVED",
  "paidAt": null, "completedAt": null, "createdAt": "…", "updatedAt": "…",
  "history": [{ "type": "ORDER", "value": "RECEIVED", "at": "…", "by": "customer" }]
}
```
**PublicStatus** (no phone, name shortened to "Karma D.")
```json
{
  "orderId": "…", "customerName": "Karma D.", "orderType": "DINE_IN", "tableNumber": 7,
  "itemCount": 2, "totalAmount": 160, "paymentStatus": "UNPAID", "orderStatus": "PREPARING",
  "createdAt": "…", "updatedAt": "…", "history": [{ "value": "RECEIVED", "at": "…" }]
}
```

---

## Login

### `POST /api/auth/login` `{ "email", "password" }`
`200 { "ok": true, "name": "Café Owner" }` and sets the `cst_admin_session` cookie (httpOnly, 12 h).
`401` wrong details, `429` after 5 failures (15 min).

### `POST /api/auth/logout` → `{ "ok": true }` (clears the cookie)

### `GET /api/auth/me` → `{ "name", "email", "role" }` or `401`

---

## Admin (cookie required – otherwise `401`)

### `GET /api/admin/orders`
Query (all optional): `view=active` (Received/Preparing/Ready), `status`, `payment`, `type`,
`from=YYYY-MM-DD`, `to=YYYY-MM-DD` (Bhutan dates), `q` (order ID or part of it), `page` (25 per page), `sort=oldest`.
→ `{ "orders": [Receipt], "total": 42, "page": 1, "pages": 2 }`

### `GET /api/admin/orders/:orderId` → `{ "order": Receipt }`

### `PATCH /api/admin/orders/:orderId` `{ "orderStatus"?, "paymentStatus"? }`
→ `{ "order": Receipt }`. Rules (`409` if broken):
- status only moves forward; `COMPLETED` needs `PAID`; `COMPLETED` and `CANCELLED` are final;
- a `PAID` order can't be cancelled (set `UNPAID` first); payment of a cancelled/completed order can't change.
- Sending both fields applies payment first, so `{ "paymentStatus": "PAID", "orderStatus": "COMPLETED" }` works in one call.

### `GET /api/admin/menu` → `{ "items": [Item], "categories": [Category] }` (including hidden)
### `POST /api/admin/menu`
`{ "name", "category": "<categoryId>", "price", "description"?, "image"?, "isAvailable"?, "isActive"?, "isFeatured"? }`
→ `201 { "item": Item }`. `image` must be empty, `/images/...` or `https://...`.
### `PATCH /api/admin/menu/:id` – any of the fields above → `{ "item": Item }`
### `DELETE /api/admin/menu/:id` → `{ "ok": true }`

### `POST /api/admin/categories` `{ "name", "icon"?, "sortOrder"?, "isActive"? }` → `201 { "category" }`
### `PATCH /api/admin/categories/:id` (any of those) → `{ "category" }`
### `DELETE /api/admin/categories/:id` → `{ "ok": true }` (`409` if it still has items)

### `GET /api/admin/summary`
```json
{
  "totalOrders": 48, "cancelledCount": 2, "todayOrders": 12,
  "revenue": { "total": 980, "count": 6 },
  "paidNotCollected": { "total": 240, "count": 2 },
  "unpaid": { "total": 4850, "count": 40 },
  "today": { "sales": 980, "count": 6 }, "month": { "sales": 980, "count": 6 },
  "orderTypes": { "TAKEAWAY": 45, "DINE_IN": 3 },
  "statusCounts": { "RECEIVED": 30, "COMPLETED": 6 },
  "daily":   [{ "date": "2026-10-14", "sales": 0, "orders": 0 }],
  "monthly": [{ "month": "2025-11", "sales": 0, "orders": 0 }],
  "popular": [{ "id": "…", "name": "Milk Tea", "quantity": 92, "revenue": 1840 }]
}
```
Sales (`revenue`, `today`, `month`, `daily`, `monthly`) = orders that are **PAID and COMPLETED** only.

### `GET /api/admin/settings` → Settings
### `PUT /api/admin/settings` – full Settings object (all fields) → Settings
