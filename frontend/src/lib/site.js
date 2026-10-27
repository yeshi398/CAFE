import "server-only";
import { headers } from "next/headers";

/**
 * Public base URL of the site, used for QR codes.
 * Prefers NEXT_PUBLIC_SITE_URL (set this in production!), otherwise falls back
 * to the host the request arrived on.
 */
export async function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (fromEnv) return fromEnv;
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function isLocalUrl(url) {
  return /\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:|\/|$)/i.test(url);
}

export function menuUrl(siteUrl, table) {
  return table ? `${siteUrl}/menu?table=${table}` : `${siteUrl}/menu`;
}
