import { connectDB } from "./db.js";
import Category from "../models/Category.js";
import MenuItem from "../models/MenuItem.js";

export function serializeItem(i) {
  return {
    id: String(i._id),
    name: i.name,
    description: i.description || "",
    price: i.price,
    image: i.image || "",
    isAvailable: !!i.isAvailable,
    isActive: !!i.isActive,
    isFeatured: !!i.isFeatured,
    categoryId: String(i.category?._id || i.category),
    createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : null,
    updatedAt: i.updatedAt ? new Date(i.updatedAt).toISOString() : null,
  };
}

export function serializeCategory(c) {
  return {
    id: String(c._id),
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    sortOrder: c.sortOrder,
    isActive: !!c.isActive,
  };
}

/** Menu as customers see it: active categories with their active items. */
export async function getPublicMenu() {
  await connectDB();
  const [categories, items] = await Promise.all([
    Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    MenuItem.find({ isActive: true }).sort({ name: 1 }).lean(),
  ]);
  const activeIds = new Set(categories.map((c) => String(c._id)));
  return {
    categories: categories.map(serializeCategory),
    items: items.filter((i) => activeIds.has(String(i.category))).map(serializeItem),
  };
}
