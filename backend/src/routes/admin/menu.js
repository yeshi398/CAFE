import { Router } from "express";
import { ApiError } from "../../lib/errors.js";
import { menuItemSchema, menuItemUpdateSchema } from "../../lib/validation.js";
import { serializeItem, serializeCategory } from "../../lib/menu.js";
import MenuItem from "../../models/MenuItem.js";
import Category from "../../models/Category.js";

const router = Router();

const checkId = (id) => {
  if (!/^[a-f\d]{24}$/i.test(id)) throw new ApiError(400, "Invalid id");
};

// GET /api/admin/menu – every item and category, including hidden ones
router.get("/", async (_req, res) => {
  const [items, categories] = await Promise.all([
    MenuItem.find().sort({ name: 1 }).lean(),
    Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
  ]);
  res.json({ items: items.map(serializeItem), categories: categories.map(serializeCategory) });
});

// POST /api/admin/menu – add an item
router.post("/", async (req, res) => {
  const data = menuItemSchema.parse(req.body ?? {});
  if (!(await Category.exists({ _id: data.category }))) throw new ApiError(400, "Category not found");
  const item = await MenuItem.create(data);
  res.status(201).json({ item: serializeItem(item.toObject()) });
});

// PATCH /api/admin/menu/:id – edit any fields (name, price, availability…)
router.patch("/:id", async (req, res) => {
  checkId(req.params.id);
  const body = req.body ?? {};
  const data = menuItemUpdateSchema.parse(body);
  // Only apply the fields actually sent (partial schema fills in defaults otherwise)
  const update = Object.fromEntries(Object.entries(data).filter(([k]) => k in body));
  if (update.category && !(await Category.exists({ _id: update.category }))) {
    throw new ApiError(400, "Category not found");
  }
  const item = await MenuItem.findByIdAndUpdate(req.params.id, update, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
  if (!item) throw new ApiError(404, "Menu item not found");
  res.json({ item: serializeItem(item) });
});

// DELETE /api/admin/menu/:id – permanent. Old receipts keep their own copy of name/price.
router.delete("/:id", async (req, res) => {
  checkId(req.params.id);
  const deleted = await MenuItem.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "Menu item not found");
  res.json({ ok: true });
});

export default router;
