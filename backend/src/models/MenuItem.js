import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 }, // Bhutanese Ngultrum (Nu.)
    image: { type: String, trim: true, default: "" }, // URL or /images/menu/xyz.jpg
    // Temporarily sold out (still shown on the menu, cannot be ordered)
    isAvailable: { type: Boolean, default: true },
    // Deactivated items are hidden from customers completely ("soft delete")
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MenuItemSchema.index({ category: 1, isActive: 1 });

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
