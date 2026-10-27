// Seeds sample categories + menu items, default settings, and the first admin.
//
//   npm run seed          → adds sample data only if the menu is empty
//   npm run seed:reset    → DELETES all categories and menu items, then re-adds samples
//                           (orders and admins are never touched)
//
// Reads MONGODB_URI and ADMIN_* from backend/.env.
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Category from "../src/models/Category.js";
import MenuItem from "../src/models/MenuItem.js";
import Admin from "../src/models/Admin.js";
import Settings from "../src/models/Settings.js";

const reset = process.argv.includes("--reset");

const CATEGORIES = [
  { name: "Breakfast", slug: "breakfast", icon: "🍳", sortOrder: 1 },
  { name: "Snacks", slug: "snacks", icon: "🥟", sortOrder: 2 },
  { name: "Meals", slug: "meals", icon: "🍛", sortOrder: 3 },
  { name: "Fast Food", slug: "fast-food", icon: "🍔", sortOrder: 4 },
  { name: "Hot Beverages", slug: "hot-beverages", icon: "☕", sortOrder: 5 },
  { name: "Cold Beverages", slug: "cold-beverages", icon: "🧋", sortOrder: 6 },
  { name: "Special Items", slug: "special-items", icon: "⭐", sortOrder: 7 },
];

// [category slug, name, description, price (Nu.), featured?, available?]
const ITEMS = [
  ["breakfast", "Puri Sabji", "Four fluffy puris with spiced potato curry.", 60, false],
  ["breakfast", "Egg Toast Combo", "Two eggs your way, buttered toast and a small milk tea.", 70, true],
  ["breakfast", "Aloo Paratha", "Stuffed flatbread with curd and pickle.", 60],
  ["breakfast", "Honey Pancakes", "Three pancakes drizzled with local Bumthang honey.", 80],
  ["snacks", "Veg Momo (10 pcs)", "Steamed cabbage-and-cheese momos with ezay.", 80, true],
  ["snacks", "Chicken Momo (10 pcs)", "Juicy steamed chicken momos with tomato achar.", 110, true],
  ["snacks", "Samosa (2 pcs)", "Crisp potato samosas with mint chutney.", 30],
  ["snacks", "Mixed Pakora", "Onion, potato and chilli fritters.", 50],
  ["meals", "Ema Datshi with Red Rice", "Bhutan's national dish – chillies in cheese – with red rice and dal.", 120, true],
  ["meals", "Kewa Datshi Meal", "Potato and cheese curry with red rice and dal.", 110],
  ["meals", "Chicken Curry Rice", "Home-style chicken curry, rice, dal and saag.", 150],
  ["meals", "Veg Thali", "Rice, dal, two veg curries, saag, papad and pickle.", 130],
  ["meals", "Egg Fried Rice", "Wok-tossed rice with egg and vegetables.", 100],
  ["fast-food", "Veg Chowmein", "Stir-fried noodles with vegetables.", 80],
  ["fast-food", "Chicken Burger", "Crispy chicken patty, lettuce, mayo, with fries.", 130],
  ["fast-food", "Grilled Veg Sandwich", "Cheese, tomato, onion and capsicum on toasted bread.", 70],
  ["fast-food", "French Fries", "Salted fries with ketchup.", 60],
  ["hot-beverages", "Suja (Butter Tea)", "Traditional salted butter tea.", 30],
  ["hot-beverages", "Milk Tea", "Sweet, strong ja ngarmo.", 20, true],
  ["hot-beverages", "Black Coffee", "Freshly brewed.", 40],
  ["hot-beverages", "Cappuccino", "Espresso with steamed, foamed milk.", 80],
  ["hot-beverages", "Hot Chocolate", "Rich cocoa with milk.", 70],
  ["cold-beverages", "Cold Coffee", "Blended iced coffee with a scoop of ice cream.", 90, true],
  ["cold-beverages", "Lemon Iced Tea", "Fresh lemon, chilled black tea.", 60],
  ["cold-beverages", "Mango Lassi", "Thick yoghurt and mango smoothie.", 80],
  ["cold-beverages", "Fresh Lime Soda", "Sweet or salted.", 50],
  ["cold-beverages", "Bottled Water (1 L)", "", 20],
  ["special-items", "Hoentay (6 pcs)", "Haa-style buckwheat dumplings with turnip leaves and cheese.", 120, true],
  ["special-items", "Chicken Thukpa", "Hearty noodle soup – perfect for exam-week evenings.", 100],
  ["special-items", "Shakam Datshi", "Dried beef with chillies and cheese, with red rice. Fridays only.", 160, false, false],
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing – create backend/.env first (see .env.example).");
  await mongoose.connect(uri);
  console.log("✔ Connected to MongoDB");

  // Make sure unique indexes exist before inserting anything.
  await Promise.all([Category.init(), MenuItem.init(), Admin.init(), Settings.init()]);
  const { default: Order } = await import("../src/models/Order.js");
  const { default: Counter } = await import("../src/models/Counter.js");
  await Promise.all([Order.init(), Counter.init()]);

  if (reset) {
    await MenuItem.deleteMany({});
    await Category.deleteMany({});
    console.log("✔ Cleared categories and menu items");
  }

  if ((await MenuItem.countDocuments()) === 0) {
    const bySlug = {};
    for (const c of CATEGORIES) {
      const doc = await Category.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, returnDocument: "after" });
      bySlug[c.slug] = doc._id;
    }
    await MenuItem.insertMany(
      ITEMS.map(([slug, name, description, price, featured = false, available = true]) => ({
        category: bySlug[slug],
        name,
        description,
        price,
        isFeatured: featured,
        isAvailable: available,
      }))
    );
    console.log(`✔ Added ${CATEGORIES.length} categories and ${ITEMS.length} menu items`);
  } else {
    console.log("• Menu already has items – skipped (use `npm run seed:reset` to start over)");
  }

  if (!(await Settings.exists({ key: "global" }))) {
    await Settings.create({ key: "global" });
    console.log("✔ Created default café settings");
  }

  if ((await Admin.countDocuments()) === 0) {
    const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.log("! No admin created – set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env and run again");
    } else if (ADMIN_PASSWORD.length < 8) {
      console.log("! ADMIN_PASSWORD must be at least 8 characters");
    } else {
      await Admin.create({
        name: ADMIN_NAME || "Café Owner",
        email: ADMIN_EMAIL.toLowerCase(),
        passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
        role: "owner",
      });
      console.log(`✔ Created admin ${ADMIN_EMAIL.toLowerCase()} – log in at /admin/login`);
    }
  } else {
    console.log("• Admin account already exists – skipped");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch(async (err) => {
  console.error("✖ Seed failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
