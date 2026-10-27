import mongoose from "mongoose";

// Atomic sequence counters. One document per day, e.g. { _id: "order-20261020", seq: 7 }.
// MongoDB's findOneAndUpdate + $inc is atomic, so two customers ordering at the
// same instant can never receive the same number.
const CounterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { versionKey: false }
);

export default mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
