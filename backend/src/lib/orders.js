import crypto from "node:crypto";
import mongoose from "mongoose";
import { connectDB } from "./db.js";
import { ApiError } from "./errors.js";
import { getSettings, chargesFor } from "./settings.js";
import { orderInputSchema } from "./validation.js";
import { bhutanDateParts, round2, maskName } from "./format.js";
import { STATUS_FLOW } from "./constants.js";
import Order from "../models/Order.js";
import MenuItem from "../models/MenuItem.js";
import Counter from "../models/Counter.js";

/* ───────────────────────── Order ID ─────────────────────────
   Format: CST-YYYYMMDD-NNN (Bhutan date, 3+ digit daily sequence).
   The sequence comes from an atomic $inc on a per-day counter document,
   and Order.orderId has a unique index as a final safety net. */
export async function nextOrderId(now = new Date()) {
  const { y, m, d } = bhutanDateParts(now);
  const day = `${y}${m}${d}`;
  const counter = await Counter.findOneAndUpdate(
    { _id: `order-${day}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  ).lean();
  return `CST-${day}-${String(counter.seq).padStart(3, "0")}`;
}

function isDuplicateKey(err) {
  return err?.code === 11000;
}

/* ───────────────────────── Create order ───────────────────────── */

/**
 * Validates the request, prices it from the database, and saves it.
 * The browser only sends item ids and quantities – every price and total
 * is worked out here on the server.
 * Returns { order, created } where created=false means a duplicate submit.
 */
export async function createOrder(rawInput) {
  const input = orderInputSchema.parse(rawInput);
  await connectDB();

  // 1. Duplicate submission? (double-click, network retry, refresh)
  const existing = await Order.findOne({ idempotencyKey: input.idempotencyKey }).select("+accessToken").lean();
  if (existing) return { order: existing, created: false };

  // 2. Café open for orders?
  const settings = await getSettings();
  if (!settings.acceptingOrders) {
    throw new ApiError(409, "Sorry, CST Café is not accepting online orders right now. Please order at the counter.");
  }

  // 3. Table number check for dine-in
  let tableNumber = null;
  if (input.orderType === "DINE_IN") {
    tableNumber = input.tableNumber;
    if (settings.tableCount > 0 && tableNumber > settings.tableCount) {
      throw new ApiError(400, `Table number must be between 1 and ${settings.tableCount}`, {
        fields: { tableNumber: `Tables are numbered 1–${settings.tableCount}` },
      });
    }
  }

  // 4. Merge repeated lines of the same item
  const qtyById = new Map();
  for (const { menuItemId, quantity } of input.items) {
    qtyById.set(menuItemId, (qtyById.get(menuItemId) || 0) + quantity);
  }

  // 5. Load real prices + availability from the database
  const ids = [...qtyById.keys()].map((id) => new mongoose.Types.ObjectId(id));
  const menuItems = await MenuItem.find({ _id: { $in: ids } }).populate("category", "isActive").lean();
  const byId = new Map(menuItems.map((m) => [String(m._id), m]));

  const problems = [];
  const items = [];
  for (const [id, quantity] of qtyById) {
    const m = byId.get(id);
    if (!m || !m.isActive || m.category?.isActive === false) {
      problems.push({ menuItemId: id, reason: "This item is no longer on the menu" });
      continue;
    }
    if (!m.isAvailable) {
      problems.push({ menuItemId: id, name: m.name, reason: `${m.name} is sold out right now` });
      continue;
    }
    if (quantity > 20) {
      problems.push({ menuItemId: id, name: m.name, reason: `Maximum 20 × ${m.name} per order` });
      continue;
    }
    items.push({
      menuItem: m._id,
      name: m.name, // snapshot
      unitPrice: m.price, // snapshot
      quantity,
      lineTotal: round2(m.price * quantity),
    });
  }
  if (problems.length) {
    throw new ApiError(409, problems.map((p) => p.reason).join(". ") + ". Please update your cart.", {
      unavailable: problems,
    });
  }

  // 6. Totals – calculated only here
  const subtotal = round2(items.reduce((s, i) => s + i.lineTotal, 0));
  const charges = chargesFor(input.orderType, settings);
  const additionalCharges = round2(charges.reduce((s, c) => s + c.amount, 0));
  const totalAmount = round2(subtotal + additionalCharges);

  // 7. Save (retry once if the order ID somehow collides)
  for (let attempt = 0; attempt < 8; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 15 + Math.random() * 60 * attempt));
    const orderId = await nextOrderId();
    try {
      const doc = await Order.create({
        orderId,
        accessToken: crypto.randomBytes(18).toString("base64url"),
        idempotencyKey: input.idempotencyKey,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        orderType: input.orderType,
        tableNumber,
        specialInstructions: input.specialInstructions,
        items,
        subtotal,
        charges,
        additionalCharges,
        totalAmount,
        paymentMethod: "CASH_AT_COUNTER",
        paymentStatus: "UNPAID", // always – only an admin can mark Paid
        orderStatus: "RECEIVED",
        history: [{ type: "ORDER", value: "RECEIVED", by: "customer" }],
      });
      return { order: doc.toObject(), created: true };
    } catch (err) {
      if (!isDuplicateKey(err)) throw err;
      // Same checkout submitted twice at the same moment → return the saved order.
      const dup = await Order.findOne({ idempotencyKey: input.idempotencyKey }).select("+accessToken").lean();
      if (dup) return { order: dup, created: false };
      // Otherwise the order ID clashed (unique index caught it) → take the next number.
      continue;
    }
  }
  throw new ApiError(500, "Could not create a unique order ID. Please try again.");
}

/* ───────────────────────── Reading orders ───────────────────────── */

/** Full receipt data (admin, or customer holding the access token). */
export function toReceipt(o) {
  return {
    orderId: o.orderId,
    customerName: o.customerName,
    customerPhone: o.customerPhone || "",
    orderType: o.orderType,
    tableNumber: o.tableNumber ?? null,
    specialInstructions: o.specialInstructions || "",
    items: o.items.map((i) => ({
      menuItemId: String(i.menuItem),
      name: i.name,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
    })),
    subtotal: o.subtotal,
    charges: (o.charges || []).map((c) => ({ label: c.label, amount: c.amount })),
    additionalCharges: o.additionalCharges || 0,
    totalAmount: o.totalAmount,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    paidAt: o.paidAt ? new Date(o.paidAt).toISOString() : null,
    completedAt: o.completedAt ? new Date(o.completedAt).toISOString() : null,
    createdAt: new Date(o.createdAt).toISOString(),
    updatedAt: new Date(o.updatedAt).toISOString(),
    history: (o.history || []).map((h) => ({ type: h.type, value: h.value, at: new Date(h.at).toISOString(), by: h.by })),
  };
}

/** What anyone with just the order ID may see: no phone, masked name. */
export function toPublicStatus(o) {
  return {
    orderId: o.orderId,
    customerName: maskName(o.customerName),
    orderType: o.orderType,
    tableNumber: o.tableNumber ?? null,
    itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
    totalAmount: o.totalAmount,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    createdAt: new Date(o.createdAt).toISOString(),
    updatedAt: new Date(o.updatedAt).toISOString(),
    history: (o.history || []).filter((h) => h.type === "ORDER").map((h) => ({ value: h.value, at: new Date(h.at).toISOString() })),
  };
}

export function normalizeOrderId(raw) {
  return String(raw || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function isValidOrderIdFormat(id) {
  return /^CST-\d{8}-\d{3,6}$/.test(id);
}

function tokensMatch(a, b) {
  if (!a || !b) return false;
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/**
 * Customer-facing lookup. With the right token → full receipt; otherwise
 * public status only. Returns null when not found.
 */
export async function getOrderForCustomer(rawId, token) {
  const orderId = normalizeOrderId(rawId);
  if (!isValidOrderIdFormat(orderId)) return null;
  await connectDB();
  const o = await Order.findOne({ orderId }).select("+accessToken").lean();
  if (!o) return null;
  if (tokensMatch(token, o.accessToken)) return { access: "full", order: toReceipt(o) };
  return { access: "public", order: toPublicStatus(o) };
}

/* ───────────────────────── Admin updates ───────────────────────── */

/**
 * Business rules for status changes:
 *  • Order status moves forward only (Received → Preparing → Ready → Completed).
 *  • An order can be Completed only once it is Paid.
 *  • Cancelled and Completed orders are final.
 *  • A Paid order cannot be cancelled – mark it Unpaid first (refund), then cancel.
 *  • Payment can be undone (Paid → Unpaid) to fix mistakes, except on completed orders.
 */
export async function adminUpdateOrder(rawId, { orderStatus, paymentStatus }, adminEmail) {
  const orderId = normalizeOrderId(rawId);
  await connectDB();
  const o = await Order.findOne({ orderId });
  if (!o) throw new ApiError(404, "Order not found");

  const final = o.orderStatus === "COMPLETED" || o.orderStatus === "CANCELLED";
  const now = new Date();

  // Payment first, so "mark paid + complete" in one request works.
  if (paymentStatus && paymentStatus !== o.paymentStatus) {
    if (o.orderStatus === "CANCELLED") throw new ApiError(409, "A cancelled order cannot be marked as paid");
    if (o.orderStatus === "COMPLETED") throw new ApiError(409, "Payment of a completed order cannot be changed");
    o.paymentStatus = paymentStatus;
    o.paidAt = paymentStatus === "PAID" ? now : null;
    o.history.push({ type: "PAYMENT", value: paymentStatus, at: now, by: adminEmail });
  }

  if (orderStatus && orderStatus !== o.orderStatus) {
    if (final) throw new ApiError(409, `This order is already ${o.orderStatus.toLowerCase()} and cannot be changed`);
    if (orderStatus === "CANCELLED") {
      if (o.paymentStatus === "PAID") {
        throw new ApiError(409, "This order is marked Paid. Mark it Unpaid (after refunding) before cancelling.");
      }
    } else {
      const from = STATUS_FLOW.indexOf(o.orderStatus);
      const to = STATUS_FLOW.indexOf(orderStatus);
      if (to < from) throw new ApiError(409, "Order status can only move forward");
      if (orderStatus === "COMPLETED" && o.paymentStatus !== "PAID") {
        throw new ApiError(409, "Mark the order as Paid before completing it");
      }
    }
    o.orderStatus = orderStatus;
    if (orderStatus === "COMPLETED") o.completedAt = now;
    o.history.push({ type: "ORDER", value: orderStatus, at: now, by: adminEmail });
  }

  await o.save();
  return toReceipt(o.toObject());
}
