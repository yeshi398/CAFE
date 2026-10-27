// Shared constants used by models, server logic and UI.
// Kept free of imports so it can be used anywhere (server, client, scripts).

export const ORDER_TYPES = ["TAKEAWAY", "DINE_IN"];
export const ORDER_TYPE_LABELS = { TAKEAWAY: "Takeaway", DINE_IN: "Dine-in" };

export const ORDER_STATUSES = ["RECEIVED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];
export const ORDER_STATUS_LABELS = {
  RECEIVED: "Order Received",
  PREPARING: "Preparing",
  READY: "Ready for Collection",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUSES = ["UNPAID", "PAID"];
export const PAYMENT_STATUS_LABELS = { UNPAID: "Unpaid", PAID: "Paid" };

export const PAYMENT_METHODS = ["CASH_AT_COUNTER"];
export const PAYMENT_METHOD_LABELS = { CASH_AT_COUNTER: "Cash at Café Counter" };

// The normal life of an order. CANCELLED sits outside this sequence.
export const STATUS_FLOW = ["RECEIVED", "PREPARING", "READY", "COMPLETED"];

// Bhutan Standard Time – used for order IDs and daily/monthly sales.
export const CAFE_TIMEZONE = "Asia/Thimphu";

export const LIMITS = {
  MAX_QTY_PER_ITEM: 20,
  MAX_LINES_PER_ORDER: 30,
  NAME_MAX: 60,
  INSTRUCTIONS_MAX: 300,
};
