# CST Café – Backend (API)

Express 5 + MongoDB (Mongoose) REST API. It owns **all data and business rules**:
menu, orders, order IDs, prices, payments, admin login and sales figures.
The frontend only displays things and calls this API. See **[API.md](API.md)** for every endpoint.

## Run locally
```bash
cd backend
npm install
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
# edit .env → MONGODB_URI, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed                  # sample menu + first admin (skip if your database already has them)
npm run dev                   # http://localhost:4000 – restarts when you save a file
```
Check it works: open http://localhost:4000/api/health and http://localhost:4000/api/menu.

| Command | What it does |
|---|---|
| `npm run dev` | start with auto-restart on file changes |
| `npm start` | start (used in production) |
| `npm run seed` | add sample menu/settings/admin if missing |
| `npm run seed:reset` | **delete all menu items & categories** and re-add samples (orders kept) |
| `npm run create-admin -- email "Password" "Name" [owner\|staff]` | add an admin or reset a password |

## Folder structure
```
backend/
├─ src/
│  ├─ server.js          starts the server (connects to MongoDB, listens on PORT)
│  ├─ app.js             Express app: middleware + routes
│  ├─ config.js          reads .env, checks required values
│  ├─ routes/
│  │  ├─ public.js       /api/menu, /api/settings, /api/orders…
│  │  ├─ auth.js         /api/auth/login, logout, me
│  │  └─ admin/          /api/admin/* (index.js applies requireAdmin to all)
│  ├─ middleware/
│  │  ├─ auth.js         session cookie, requireAdmin, CSRF check, login throttle
│  │  └─ errors.js       404 + one place that turns errors into JSON
│  ├─ lib/
│  │  ├─ orders.js       createOrder (server-side pricing), order IDs, status rules
│  │  ├─ summary.js      dashboard figures
│  │  ├─ validation.js   all Zod input schemas
│  │  ├─ menu.js, settings.js, session.js, db.js, errors.js
│  │  └─ constants.js, format.js, pricing.js   ← ALSO in frontend/src/lib – keep identical
│  └─ models/            Category, MenuItem, Order, Admin, Counter, Settings
├─ scripts/              seed.js, create-admin.js
├─ API.md                the contract with the frontend
└─ .env.example
```

## Adding a new endpoint (checklist)
1. Add the route in `src/routes/...` (async handlers can just `throw new ApiError(status, "message")`).
2. Validate the input with a Zod schema in `src/lib/validation.js`.
3. Admin-only? Put it under `src/routes/admin/` – `requireAdmin` is applied automatically.
4. Document it in **API.md**, then tell the frontend developer.
5. Test with the browser (GET) or Thunder Client / Postman / `curl`.

## Security rules this API enforces
Prices and totals are calculated here from the database (never trusted from the browser) · new orders are always
UNPAID · only admins can change status/payment · order IDs come from an atomic MongoDB counter + unique index ·
duplicate submissions are blocked with an idempotency key · passwords are bcrypt-hashed · sessions are signed JWTs
in httpOnly cookies · admin changes from other websites are rejected · every input is validated with Zod.
