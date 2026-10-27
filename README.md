# CST Café – Online Menu & Food Ordering

Ordering website for **CST Café, College of Science and Technology (Royal University of Bhutan)**.
Customers scan a QR code, order from their phone without an account, and pay cash at the counter.
The café owner manages orders, the menu and sales from an admin dashboard.

The project is split into two apps in one repository:

| Folder | What it is | Tech | Owner |
|---|---|---|---|
| [`backend/`](backend/README.md) | REST API – data, business rules, login | Node.js · Express 5 · MongoDB (Mongoose) · Zod | Backend developer |
| [`frontend/`](frontend/README.md) | Website – customer pages + admin screens | Next.js 16 · React 19 · Tailwind CSS 4 | Frontend developer |
| [`backend/API.md`](backend/API.md) | **The contract** – every endpoint, request and response | – | Both |

```
 Phone / laptop browser
        │  https://cst-cafe.vercel.app/menu , /api/...
        ▼
 ┌──────────────────────┐   /api/* forwarded    ┌──────────────────────┐        ┌──────────────┐
 │  frontend (Next.js)  │ ────────────────────► │  backend (Express)   │ ─────► │ MongoDB Atlas│
 │  pages, cart, admin  │ ◄──────────────────── │  /api/... JSON       │ ◄───── │  cst-cafe DB │
 └──────────────────────┘        JSON           └──────────────────────┘        └──────────────┘
      port 3000 / Vercel                              port 4000 / Render
```

---

## 1. Run the whole project locally

Requirements: Node.js 20.9+ and a MongoDB database (MongoDB Atlas free cluster, or MongoDB installed locally).
You need **two terminals**.

**Terminal 1 – backend**
```bash
cd backend
npm install
cp .env.example .env        # PowerShell: Copy-Item .env.example .env   → then edit .env
npm run seed                # first time only (sample menu + admin)
npm run dev                 # → http://localhost:4000
```

**Terminal 2 – frontend**
```bash
cd frontend
npm install
cp .env.example .env.local  # PowerShell: Copy-Item .env.example .env.local
npm run dev                 # → http://localhost:3000
```
Open http://localhost:3000 (customer) and http://localhost:3000/admin/login (owner).

> The frontend developer can also point `BACKEND_URL` at the deployed backend
> (e.g. `https://cst-cafe-api.onrender.com`) and work without running the backend or having database access.

---

## 2. Working together on GitHub

### First-time setup (backend developer, once)
1. Create an **empty** repository on GitHub (no README), e.g. `cst-cafe`.
2. In this folder:
   ```bash
   git init
   git add .
   git status          # make sure NO .env or .env.local files are listed!
   git commit -m "Initial commit: backend and frontend"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/cst-cafe.git
   git push -u origin main
   ```
3. GitHub → repo **Settings → Collaborators → Add people** → invite your friend.
4. Edit `.github/CODEOWNERS` with both GitHub usernames and push.
5. (Recommended) **Settings → Branches → Add rule** for `main`: *Require a pull request before merging*.

### Friend's first-time setup
```bash
git clone https://github.com/YOUR-USERNAME/cst-cafe.git
cd cst-cafe/frontend
npm install
cp .env.example .env.local
```

### Everyday workflow (both of you)
```bash
git checkout main
git pull                                   # get the latest
git checkout -b frontend/menu-search       # or backend/add-discounts
# ...edit files only in YOUR folder...
git add frontend                           # or: git add backend
git commit -m "Frontend: improve menu search"
git push -u origin frontend/menu-search
```
Then on GitHub: **Compare & pull request** → the other person reviews → **Merge**. Afterwards everyone runs
`git checkout main && git pull`.

**Branch names:** `backend/<what>` and `frontend/<what>`.
**Commit messages:** start with `Backend:` or `Frontend:` so the history shows who worked on what.

### Rules that prevent conflicts
- Backend developer edits only `backend/`; frontend developer edits only `frontend/`.
- **API changes go through `backend/API.md`.** The backend developer updates it in the same pull request
  and tells the frontend developer. The frontend developer asks there for new data instead of guessing.
- `constants.js`, `format.js` and `pricing.js` exist in **both** `backend/src/lib` and `frontend/src/lib`
  (order statuses, Nu. formatting, charges). If one changes, copy the change to the other.
- Never commit `.env` / `.env.local` – they hold the database password. Each person keeps their own.
  Share secrets privately (not in GitHub, not in group chats).

---

## 3. Deploy (free)

Deploy the **backend first**, because the frontend needs its address.

### MongoDB Atlas
**Network Access → Add IP Address → Allow access from anywhere (`0.0.0.0/0`)** (hosting providers change IPs).

### Backend → Render
1. render.com → sign in with GitHub → **New → Web Service** → pick the repo.
2. **Root Directory:** `backend` · **Build Command:** `npm install` · **Start Command:** `npm start` · Instance: *Free*.
3. **Environment:** `MONGODB_URI` (Atlas string with `/cst-cafe`), `AUTH_SECRET` (new random string).
4. Create. You get e.g. `https://cst-cafe-api.onrender.com` → open `/api/health` to check.
5. After the frontend is deployed (next step), add `FRONTEND_URL=https://cst-cafe.vercel.app` here too
   (admin changes are only accepted from that address).

Free Render services sleep after ~15 min idle; the first request then takes ~30–60 s. Fine for a project demo;
use a paid instance (or Railway/Koyeb) for real daily café use.

### Frontend → Vercel
1. vercel.com → **Add New → Project** → import the repo.
2. **Root Directory:** `frontend` (framework Next.js is detected).
3. **Environment Variables:** `BACKEND_URL=https://cst-cafe-api.onrender.com`, `NEXT_PUBLIC_SITE_URL` (leave empty for now).
4. Deploy → you get e.g. `https://cst-cafe.vercel.app`.
5. Set `NEXT_PUBLIC_SITE_URL=https://cst-cafe.vercel.app` → **Redeploy**.
6. Admin → **QR codes** → download/print. The codes now open the live menu on any phone.

Every merge to `main` redeploys both automatically.

---

## 4. Features
**Customers:** menu with categories & search · cart · Takeaway / Dine-in (table QR codes pre-select the table) ·
receipt with unique Order ID (`CST-20261027-001`), print / save PDF / copy ID · live order tracking.
**Owner:** live orders with filters & search · status flow Received → Preparing → Ready → Completed · mark paid ·
cancel · menu & category management · sold-out toggle · sales dashboard (paid + completed only) · QR codes ·
settings (hours, tables, takeaway charge, pause ordering).

## 5. Troubleshooting
| Problem | Fix |
|---|---|
| Frontend shows "We couldn't load the menu" | Backend not running, or wrong `BACKEND_URL` in `frontend/.env.local`. Check http://localhost:4000/api/health |
| Backend: `MONGODB_URI is not set` | Create `backend/.env` from `.env.example` |
| Backend: "Could not connect to MongoDB" | Wrong password in the string, missing `/cst-cafe`, or Atlas Network Access |
| Admin buttons say "Cross-site request blocked" | Set `FRONTEND_URL` on the backend to the exact website address |
| Can't log in | `cd backend && npm run create-admin -- you@mail.com "NewPassword"` |
| QR opens localhost on the phone | Set `NEXT_PUBLIC_SITE_URL` to the deployed URL (or your laptop's IP for Wi-Fi testing) and restart |
| PowerShell: "running scripts is disabled" | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use Command Prompt |
| `git push` rejected | `git pull` first, fix any conflicts, then push again |
