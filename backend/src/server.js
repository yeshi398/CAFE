import { config } from "./config.js";
import { connectDB } from "./lib/db.js";
import { createApp } from "./app.js";

async function start() {
  try {
    await connectDB(config.mongoUri);
    console.log("✔ Connected to MongoDB");
  } catch (err) {
    // Keep running – requests will retry and return a clear 503 until the DB is reachable.
    console.error("✖ Could not connect to MongoDB:", err.message);
  }

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`✔ CST Café API running on http://localhost:${config.port}`);
  });
}

start();
