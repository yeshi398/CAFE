import express from "express";
import cookieParser from "cookie-parser";
import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin/index.js";
import { notFound, errorHandler } from "./middleware/errors.js";

/** Builds the Express app (kept separate from server.js so it's easy to test). */
export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Behind the frontend's proxy / Render's load balancer: trust X-Forwarded-* headers
  app.set("trust proxy", true);

  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  // Security + no caching for API responses
  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
      "Cache-Control": "no-store",
    });
    next();
  });

  app.get("/", (_req, res) => res.json({ name: "CST Café API", status: "ok", docs: "See API.md" }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

  app.use("/api", publicRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
