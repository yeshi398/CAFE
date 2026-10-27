// Loads backend/.env (if present) and checks required settings at startup.
import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`✖ ${name} is not set. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: required("MONGODB_URI"),
  authSecret: required("AUTH_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
};

if (config.authSecret.length < 32) {
  console.error("✖ AUTH_SECRET must be at least 32 characters long.");
  process.exit(1);
}
