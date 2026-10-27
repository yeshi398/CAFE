import { Router } from "express";
import { ApiError } from "../../lib/errors.js";
import { adminUpdateOrder, toReceipt, normalizeOrderId } from "../../lib/orders.js";
import { orderUpdateSchema } from "../../lib/validation.js";
import { bhutanDayStart } from "../../lib/format.js";
import { ORDER_STATUSES, ORDER_TYPES, PAYMENT_STATUSES } from "../../lib/constants.js";
import Order from "../../models/Order.js";

const router = Router();
const isDateKey = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "");
const str = (v) => (typeof v === "string" ? v : "");

// GET /api/admin/orders?view=active&status=&payment=&type=&from=YYYY-MM-DD&to=YYYY-MM-DD&q=&page=1&sort=oldest
router.get("/", async (req, res) => {
  const { view, status, payment, type, from, to, q, sort } = Object.fromEntries(
    Object.entries(req.query).map(([k, v]) => [k, str(v)])
  );
  const filter = {};

  if (ORDER_STATUSES.includes(status)) filter.orderStatus = status;
  else if (view === "active") filter.orderStatus = { $in: ["RECEIVED", "PREPARING", "READY"] };
  if (PAYMENT_STATUSES.includes(payment)) filter.paymentStatus = payment;
  if (ORDER_TYPES.includes(type)) filter.orderType = type;
  if (isDateKey(from) || isDateKey(to)) {
    filter.createdAt = {};
    if (isDateKey(from)) filter.createdAt.$gte = bhutanDayStart(from);
    if (isDateKey(to)) filter.createdAt.$lt = new Date(bhutanDayStart(to).getTime() + 86400000);
  }
  if (q) {
    // Search by order ID (full or last digits). Only A-Z, 0-9 and "-" are kept,
    // so the search can't be abused as a regular expression.
    const safe = normalizeOrderId(q).replace(/[^A-Z0-9-]/g, "").replace(/-/g, "\\-");
    if (safe) filter.orderId = { $regex: safe };
  }

  const page = Math.max(1, parseInt(str(req.query.page) || "1", 10) || 1);
  const pageSize = 25;
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: sort === "oldest" ? 1 : -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json({ orders: orders.map(toReceipt), total, page, pages: Math.max(1, Math.ceil(total / pageSize)) });
});

// GET /api/admin/orders/:orderId
router.get("/:orderId", async (req, res) => {
  const o = await Order.findOne({ orderId: normalizeOrderId(req.params.orderId) }).lean();
  if (!o) throw new ApiError(404, "Order not found");
  res.json({ order: toReceipt(o) });
});

// PATCH /api/admin/orders/:orderId  { orderStatus?, paymentStatus? }
router.patch("/:orderId", async (req, res) => {
  const changes = orderUpdateSchema.parse(req.body ?? {});
  const order = await adminUpdateOrder(req.params.orderId, changes, req.admin.email);
  res.json({ order });
});

export default router;
