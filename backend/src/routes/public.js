// Routes anyone can use – no login.
import { Router } from "express";
import { getPublicMenu } from "../lib/menu.js";
import { getSettings } from "../lib/settings.js";
import { createOrder, getOrderForCustomer } from "../lib/orders.js";

const router = Router();

// GET /api/menu – active categories + items
router.get("/menu", async (_req, res) => {
  res.json(await getPublicMenu());
});

// GET /api/settings – café info, charges, table count, open/closed
router.get("/settings", async (_req, res) => {
  res.json(await getSettings());
});

// POST /api/orders – place an order.
// Body: { customerName, customerPhone?, orderType, tableNumber?, specialInstructions?,
//         items: [{ menuItemId, quantity }], idempotencyKey }
// Prices, totals and statuses sent by the browser are ignored.
router.post("/orders", async (req, res) => {
  const { order, created } = await createOrder(req.body ?? {});
  res.status(created ? 201 : 200).json({
    orderId: order.orderId,
    accessToken: order.accessToken,
    totalAmount: order.totalAmount,
    duplicate: !created,
  });
});

// GET /api/orders/:orderId[?token=] – status only, or full receipt with the token
router.get("/orders/:orderId", async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : null;
  const result = await getOrderForCustomer(req.params.orderId, token);
  if (!result) return res.status(404).json({ error: "No order found with that ID. Please check and try again." });
  res.json(result);
});

export default router;
