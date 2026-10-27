// Everything under /api/admin requires a logged-in admin.
import { Router } from "express";
import { requireAdmin } from "../../middleware/auth.js";
import { getSalesSummary } from "../../lib/summary.js";
import { getSettings, serializeSettings } from "../../lib/settings.js";
import { settingsSchema } from "../../lib/validation.js";
import Settings from "../../models/Settings.js";
import ordersRouter from "./orders.js";
import menuRouter from "./menu.js";
import categoriesRouter from "./categories.js";

const router = Router();
router.use(requireAdmin);

router.use("/orders", ordersRouter);
router.use("/menu", menuRouter);
router.use("/categories", categoriesRouter);

// GET /api/admin/summary – dashboard figures
router.get("/summary", async (_req, res) => {
  res.json(await getSalesSummary());
});

// GET /api/admin/settings
router.get("/settings", async (_req, res) => {
  res.json(await getSettings());
});

// PUT /api/admin/settings – café info, charges, table count, ordering on/off
router.put("/settings", async (req, res) => {
  const data = settingsSchema.parse(req.body ?? {});
  await getSettings(); // make sure the document exists
  const doc = await Settings.findOneAndUpdate({ key: "global" }, data, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
  res.json(serializeSettings(doc));
});

export default router;
