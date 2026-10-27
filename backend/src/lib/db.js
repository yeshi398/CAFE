import mongoose from "mongoose";

let connecting = null;

/** Connects once and reuses the connection for every request. */
export async function connectDB(uri = process.env.MONGODB_URI) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connecting) {
    connecting = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .catch((err) => {
        connecting = null; // allow a retry
        throw err;
      });
  }
  await connecting;
  return mongoose.connection;
}
