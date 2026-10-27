import { ApiError } from "../lib/errors.js";
import { zodErrors } from "../lib/validation.js";

export function notFound(req, res) {
  res.status(404).json({ error: `No API route for ${req.method} ${req.path}` });
}

/** Every error ends up here and becomes a clear JSON message. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, ...err.extra });
  }
  if (err?.name === "ZodError") {
    const { message, fields } = zodErrors(err);
    return res.status(400).json({ error: message, fields });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON" });
  }
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Request is too large" });
  }
  if (err?.name === "MongooseServerSelectionError" || err?.name === "MongoServerSelectionError") {
    console.error("[db] cannot reach MongoDB:", err.message);
    return res.status(503).json({ error: "The café system is temporarily unavailable. Please try again shortly." });
  }
  if (err?.name === "CastError") return res.status(400).json({ error: "Invalid id" });
  console.error("[api] unexpected error:", err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
