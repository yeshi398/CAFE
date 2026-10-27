import mongoose from "mongoose";
import {
  ORDER_TYPES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "../lib/constants.js";

// Each line stores a SNAPSHOT of the name and price at the time of ordering,
// so old receipts stay correct even if the menu changes later.
const OrderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ChargeSchema = new mongoose.Schema(
  { label: { type: String, required: true }, amount: { type: Number, required: true, min: 0 } },
  { _id: false }
);

const StatusEventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["ORDER", "PAYMENT"], required: true },
    value: { type: String, required: true },
    at: { type: Date, default: Date.now },
    by: { type: String, default: "system" },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // e.g. CST-20261020-001
    // Secret needed to view the full receipt (order IDs are guessable).
    accessToken: { type: String, required: true, select: false },
    // Sent by the browser for each checkout attempt; stops double submissions.
    idempotencyKey: { type: String, unique: true, sparse: true, select: false },

    customerName: { type: String, required: true, trim: true, maxlength: 60 },
    customerPhone: { type: String, trim: true, default: "" },
    orderType: { type: String, enum: ORDER_TYPES, required: true },
    tableNumber: { type: Number, default: null },
    specialInstructions: { type: String, trim: true, maxlength: 300, default: "" },

    items: { type: [OrderItemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    charges: { type: [ChargeSchema], default: [] }, // itemised extra charges
    additionalCharges: { type: Number, default: 0, min: 0 }, // sum of charges
    totalAmount: { type: Number, required: true, min: 0 },

    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "CASH_AT_COUNTER" },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "UNPAID" },
    paidAt: { type: Date, default: null },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: "RECEIVED" },
    completedAt: { type: Date, default: null },
    history: { type: [StatusEventSchema], default: [] },
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
