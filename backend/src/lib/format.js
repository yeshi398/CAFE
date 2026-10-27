import { CAFE_TIMEZONE } from "./constants.js";

/** Format an amount in Bhutanese Ngultrum, e.g. "Nu. 1,250" or "Nu. 45.50". */
export function formatNu(amount) {
  const n = Number(amount) || 0;
  const hasDecimals = Math.round(n * 100) % 100 !== 0;
  return (
    "Nu. " +
    n.toLocaleString("en-IN", {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

/** Round to 2 decimal places without floating-point surprises. */
export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString("en-GB", {
    timeZone: CAFE_TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-GB", {
    timeZone: CAFE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Calendar parts of a date in Bhutan time: { y, m, d } as zero-padded strings. */
export function bhutanDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CAFE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(date));
  const get = (t) => parts.find((p) => p.type === t).value;
  return { y: get("year"), m: get("month"), d: get("day") };
}

/** "2026-10-20" in Bhutan time. */
export function bhutanDateKey(date = new Date()) {
  const { y, m, d } = bhutanDateParts(date);
  return `${y}-${m}-${d}`;
}

/**
 * Start of a Bhutan calendar day as a real Date (UTC instant).
 * Bhutan is UTC+6 all year (no daylight saving).
 */
export function bhutanDayStart(dateKey) {
  return new Date(`${dateKey}T00:00:00+06:00`);
}

/** Show only first name + initial on public pages, e.g. "Karma D." */
export function maskName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Customer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}
