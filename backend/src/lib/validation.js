import { z } from "zod";
import { LIMITS, ORDER_STATUSES, ORDER_TYPES, PAYMENT_STATUSES } from "./constants.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

// Strip control characters and trim – applied to all free-text input.
const cleanText = (max) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max));

/* ───────────── Customer order ───────────── */

export const orderInputSchema = z
  .object({
    customerName: cleanText(LIMITS.NAME_MAX).pipe(z.string().min(2, "Please enter your name (at least 2 letters)")),
    customerPhone: z
      .string()
      .trim()
      .optional()
      .default("")
      .refine((v) => v === "" || /^\+?[0-9][0-9\s-]{6,14}$/.test(v), "Enter a valid phone number or leave it empty"),
    orderType: z.enum(ORDER_TYPES, { message: "Choose Takeaway or Dine-in" }),
    tableNumber: z.coerce.number().int().min(1).max(200).nullish(),
    specialInstructions: cleanText(LIMITS.INSTRUCTIONS_MAX).optional().default(""),
    items: z
      .array(
        z.object({
          menuItemId: objectId,
          quantity: z.coerce.number().int().min(1).max(LIMITS.MAX_QTY_PER_ITEM, `Maximum ${LIMITS.MAX_QTY_PER_ITEM} of one item`),
        })
      )
      .min(1, "Your cart is empty")
      .max(LIMITS.MAX_LINES_PER_ORDER, "Too many different items in one order"),
    idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/, "Invalid request key"),
  })
  // Note: anything else the browser sends (prices, totals, status…) is ignored.
  .superRefine((val, ctx) => {
    if (val.orderType === "DINE_IN" && !val.tableNumber) {
      ctx.addIssue({ code: "custom", path: ["tableNumber"], message: "Please enter your table number" });
    }
  });

/* ───────────── Admin ───────────── */

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password").max(200),
});

export const orderUpdateSchema = z
  .object({
    orderStatus: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  })
  .refine((v) => v.orderStatus || v.paymentStatus, "Nothing to update");

export const menuItemSchema = z.object({
  name: cleanText(80).pipe(z.string().min(2, "Name is too short")),
  description: cleanText(300).optional().default(""),
  category: objectId,
  price: z.coerce.number().min(0, "Price cannot be negative").max(100000),
  image: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default("")
    .refine((v) => v === "" || v.startsWith("/") || /^https:\/\//i.test(v), "Use an https:// URL or a /images/... path"),
  isAvailable: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export const menuItemUpdateSchema = menuItemSchema.partial();

export const categorySchema = z.object({
  name: cleanText(40).pipe(z.string().min(2, "Name is too short")),
  icon: z.string().trim().max(8).optional().default("🍽️"),
  sortOrder: z.coerce.number().int().min(0).max(999).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const settingsSchema = z.object({
  cafeName: cleanText(60).pipe(z.string().min(2)),
  phone: cleanText(30),
  email: z.string().trim().max(80),
  location: cleanText(200),
  openingHours: z.string().trim().max(300),
  acceptingOrders: z.boolean(),
  tableCount: z.coerce.number().int().min(0).max(200),
  takeawayCharge: z.coerce.number().min(0).max(10000),
  takeawayChargeLabel: cleanText(40).pipe(z.string().min(2)),
});

/** Turn a ZodError into { field: message } for forms + one summary message. */
export function zodErrors(error) {
  const fields = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!fields[key]) fields[key] = issue.message;
  }
  return { message: error.issues[0]?.message || "Invalid input", fields };
}

export function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
