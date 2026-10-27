"use client";

/** fetch wrapper for admin pages: JSON in/out, throws Error(message) on failure, redirects on 401. */
export async function adminFetch(url, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = "/admin/login?next=" + encodeURIComponent(window.location.pathname);
    throw new Error("Session expired – please log in again");
  }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.fields = data.fields;
    throw err;
  }
  return data;
}
