import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    icon: { type: String, default: "🍽️", maxlength: 8 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);
