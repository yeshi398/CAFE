import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // bcrypt hash – the plain password is never stored. Not returned by default.
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "staff"], default: "owner" },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
