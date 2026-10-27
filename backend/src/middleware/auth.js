import { ApiError } from "../lib/errors.js";
import { SESSION_COOKIE, verifySessionToken, signSessionToken } from "../lib/session.js";

const SESSION_HOURS = 12;

function isHttps(req) {
  return req.secure || req.get("x-forwarded-proto")?.split(",")[0].trim() === "https";
}

export async function setSessionCookie(req, res, admin) {
  const token = await signSessionToken(
    { sub: String(admin._id), email: admin.email, name: admin.name, role: admin.role },
    SESSION_HOURS
  );
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true, // JavaScript in the browser cannot read it
    secure: isHttps(req), // HTTPS-only when the site is served over HTTPS
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600 * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

// The website's own address(es), set with FRONTEND_URL in .env
// (comma-separated, e.g. "https://cst-cafe.vercel.app,http://localhost:3000").
const FRONTEND_HOSTS = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((u) => hostOf(u.trim()))
  .filter(Boolean);

/** Hosts a state-changing admin request may come from. */
function allowedHosts(req) {
  const hosts = new Set(FRONTEND_HOSTS);
  for (const h of (req.get("x-forwarded-host") || "").split(",")) if (h.trim()) hosts.add(h.trim());
  if (req.get("host")) hosts.add(req.get("host"));
  return hosts;
}

/** Reads the session (or null). Does not block the request. */
export async function readSession(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  return token ? verifySessionToken(token) : null;
}

/**
 * Protects every /api/admin route.
 * 1. A valid admin session cookie is required.
 * 2. For changes (POST/PATCH/PUT/DELETE) the request must come from our own
 *    website – blocks other sites from using a logged-in admin's browser (CSRF).
 */
export async function requireAdmin(req, _res, next) {
  const session = await readSession(req);
  if (!session) throw new ApiError(401, "Please log in as an administrator");

  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.get("origin");
    if (origin && !allowedHosts(req).has(hostOf(origin))) {
      throw new ApiError(403, "Cross-site request blocked");
    }
  }

  req.admin = session;
  next();
}

/* ── Simple in-memory login throttle (per IP + email) ── */
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;

export function checkLoginThrottle(key) {
  const rec = attempts.get(key);
  if (rec && rec.count >= MAX_FAILS && Date.now() - rec.first < WINDOW_MS) {
    const mins = Math.ceil((WINDOW_MS - (Date.now() - rec.first)) / 60000);
    throw new ApiError(429, `Too many failed attempts. Try again in ${mins} minute(s).`);
  }
}
export function recordLoginFailure(key) {
  const rec = attempts.get(key);
  if (!rec || Date.now() - rec.first > WINDOW_MS) attempts.set(key, { count: 1, first: Date.now() });
  else rec.count += 1;
}
export function clearLoginFailures(key) {
  attempts.delete(key);
}
