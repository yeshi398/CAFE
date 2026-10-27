import "server-only";
import { cookies } from "next/headers";

/**
 * Talking to the backend API from SERVER components (pages that render on the server).
 *
 * Browser code (client components) simply calls "/api/..." – next.config.mjs forwards
 * those requests to the backend, so the browser only ever talks to this website.
 */
export const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:4000").replace(/\/+$/, "");
const SESSION_COOKIE = "cst_admin_session";

export class BackendError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * GET a backend endpoint and return its JSON.
 *  - returns null on 404
 *  - throws BackendError on other errors (status 401 = not logged in)
 *  - auth: true forwards the admin's login cookie (for /api/admin/... and /api/auth/me)
 */
export async function backendGet(path, { auth = false } = {}) {
  const headers = { Accept: "application/json" };
  if (auth) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) throw new BackendError(401, "Not logged in");
    headers.Cookie = `${SESSION_COOKIE}=${token}`;
  }

  let res;
  try {
    res = await fetch(BACKEND_URL + path, { headers, cache: "no-store" });
  } catch (err) {
    throw new BackendError(503, `Cannot reach the backend at ${BACKEND_URL} (${err.message}). Is it running?`);
  }
  if (res.status === 404) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new BackendError(res.status, data.error || `Backend error ${res.status}`);
  return data;
}

/** The logged-in admin ({ name, email, role }) or null. */
export async function getAdmin() {
  try {
    return await backendGet("/api/auth/me", { auth: true });
  } catch (err) {
    if (err.status === 401) return null;
    throw err;
  }
}
