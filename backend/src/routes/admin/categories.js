import { Router } from "express";
import { ApiError } from "../../lib/errors.js";
import { categorySchema, slugify } from "../../lib/validation.js";
import { serializeCategory } from "../../lib/menu.js";
import Category from "../../models/Category.js";
import MenuItem from "../../models/MenuItem.js";

const router = Router();

const checkId = (id) => {
  if (!/^[a-f\d]{24}$/i.test(id)) throw new ApiError(400, "Invalid id");
};

// POST /api/admin/categories – add a category
router.post("/", async (req, res) => {
  const data = categorySchema.parse(req.body ?? {});
  const slug = slugify(data.name);
  if (await Category.exists({ $or: [{ slug }, { name: data.name }] })) {
    throw new ApiError(409, "A category with this name already exists");
  }
  const cat = await Category.create({ ...data, slug });
  res.status(201).json({ category: serializeCategory(cat.toObject()) });
});

// PATCH /api/admin/categories/:id – rename, reorder, show/hide
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  checkId(id);
  const body = req.body ?? {};
  const data = categorySchema.partial().parse(body);
  const update = Object.fromEntries(Object.entries(data).filter(([k]) => k in body));
  if (update.name) {
    update.slug = slugify(update.name);
    const clash = await Category.exists({ _id: { $ne: id }, $or: [{ slug: update.slug }, { name: update.name }] });
    if (clash) throw new ApiError(409, "A category with this name already exists");
  }
  const cat = await Category.findByIdAndUpdate(id, update, { returnDocument: "after", runValidators: true }).lean();
  if (!cat) throw new ApiError(404, "Category not found");
  res.json({ category: serializeCategory(cat) });
});

// DELETE /api/admin/categories/:id – only when no items use it
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  checkId(id);
  const used = await MenuItem.countDocuments({ category: id });
  if (used > 0) {
    throw new ApiError(409, `This category still has ${used} item(s). Move or delete them first, or hide the category instead.`);
  }
  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Category not found");
  res.json({ ok: true });
});

export default router;
