// Remembers the customer's recent orders on this device (no account needed),
// so they can reopen their receipt later. Client-side only.
const KEY = "cst-cafe-my-orders";

export function getMyOrders() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function rememberOrder({ orderId, token, totalAmount }) {
  try {
    const list = getMyOrders().filter((o) => o.orderId !== orderId);
    list.unshift({ orderId, token, totalAmount, at: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 10)));
  } catch {
    /* storage unavailable */
  }
}

export function tokenFor(orderId) {
  return getMyOrders().find((o) => o.orderId === orderId)?.token || null;
}

/** Random key that works even on plain-http LAN testing (randomUUID needs https). */
export function randomKey() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
