# CST Café – Frontend (website)

Next.js 16 (App Router) + Tailwind CSS 4. Everything customers and the café owner **see**:
home, menu, cart, checkout, receipt, order tracking, and the admin dashboard screens.
It has **no database code** – all data comes from the backend API (see `../backend/API.md`).

## Run locally
The backend must be running first (`cd backend && npm run dev` → http://localhost:4000).
```bash
cd frontend
npm install
cp .env.example .env.local    # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev                   # http://localhost:3000
```
Admin: http://localhost:3000/admin/login (the admin account is created by the backend's `npm run seed`).

## How the frontend talks to the backend
- **In the browser** (files with `"use client"`): just call `fetch("/api/...")`.
  `next.config.mjs` forwards every `/api/*` request to `BACKEND_URL`. Because the browser only ever talks to
  this website, there is no CORS setup and the admin login cookie works automatically.
- **In server pages** (no `"use client"`): use `backendGet()` from `src/lib/backend.js`.
  Pass `{ auth: true }` for admin endpoints – it forwards the login cookie.
- Admin pages in the browser use `adminFetch()` from `src/components/admin/api.js` (redirects to login on 401).

## Folder structure
```
frontend/
├─ src/
│  ├─ proxy.js                 sends visitors without a login cookie from /admin/* to /admin/login
│  ├─ app/
│  │  ├─ layout.js, globals.css   fonts, colours (coffee / cream / muted orange), print styles
│  │  ├─ (shop)/               public pages: / , /menu, /cart, /checkout, /order/[orderId], /track-order
│  │  └─ admin/                /admin/login and admin/(panel)/: dashboard, orders, menu, qr, settings
│  ├─ components/              Header, Footer, MenuItemCard, CartProvider, Receipt, OrderTracker…
│  │  └─ admin/                OrdersManager, MenuManager, QrTools, SettingsForm, AdminNav…
│  └─ lib/
│     ├─ backend.js            backendGet() / getAdmin() for server pages
│     ├─ site.js               public site URL for QR codes
│     ├─ myOrders.js           remembers a customer's orders on their phone
│     └─ constants.js, format.js, pricing.js   ← ALSO in backend/src/lib – keep identical
├─ public/                     icon.svg, images/menu/ (food photos)
└─ .env.example
```

## Notes
- The cart total shown to customers is only a preview – the backend recalculates the real total.
- Colours and button styles live in `src/app/globals.css` (`@theme` block and `.btn-*` classes).
- Food photos: put files in `public/images/menu/` and set the item's image to `/images/menu/name.jpg` in Admin → Menu.
- Need data the API doesn't provide yet? Ask the backend developer to add it to `API.md` first.
