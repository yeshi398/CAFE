import { connectDB } from "./db.js";
import Settings from "../models/Settings.js";

/** Returns the single settings document, creating it with defaults if needed. */
export async function getSettings() {
  await connectDB();
  let doc = await Settings.findOne({ key: "global" }).lean();
  if (!doc) {
    try {
      doc = (await Settings.create({ key: "global" })).toObject();
    } catch (err) {
      if (err?.code !== 11000) throw err; // created by a parallel request
      doc = await Settings.findOne({ key: "global" }).lean();
    }
  }
  return serializeSettings(doc);
}

export function serializeSettings(doc) {
  return {
    cafeName: doc.cafeName,
    phone: doc.phone,
    email: doc.email,
    location: doc.location,
    openingHours: doc.openingHours,
    acceptingOrders: doc.acceptingOrders,
    tableCount: doc.tableCount,
    takeawayCharge: doc.takeawayCharge,
    takeawayChargeLabel: doc.takeawayChargeLabel,
  };
}

export { chargesFor } from "./pricing.js";
