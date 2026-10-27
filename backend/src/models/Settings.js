import mongoose from "mongoose";

// A single settings document (key: "global") editable from the admin area.
const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    cafeName: { type: String, default: "CST Café" },
    phone: { type: String, default: "+975 17 000 000" },
    email: { type: String, default: "cafe@cst.edu.bt" },
    location: {
      type: String,
      default: "Ground floor, Student Centre, College of Science and Technology, Rinchending, Phuentsholing",
    },
    openingHours: { type: String, default: "Mon–Sat · 7:30 AM – 8:00 PM\nSunday · 9:00 AM – 6:00 PM" },
    acceptingOrders: { type: Boolean, default: true },
    tableCount: { type: Number, default: 20, min: 0, max: 200 },
    // Optional extra charges (0 = not charged)
    takeawayCharge: { type: Number, default: 0, min: 0 },
    takeawayChargeLabel: { type: String, default: "Takeaway packaging" },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
