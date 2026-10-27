// Admin login / logout / "who am I".
import { Router } from "express";
import bcrypt from "bcryptjs";
import { ApiError } from "../lib/errors.js";
import { loginSchema } from "../lib/validation.js";
import {
  setSessionCookie,
  clearSessionCookie,
  readSession,
  checkLoginThrottle,
  recordLoginFailure,
  clearLoginFailures,
} from "../middleware/auth.js";
import Admin from "../models/Admin.js";

const router = Router();

// Compared against when the email is unknown, so response time doesn't
// reveal which admin emails exist.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 12);

// POST /api/auth/login  { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = loginSchema.parse(req.body ?? {});
  const ip = req.get("x-forwarded-for")?.split(",")[0]?.trim() || req.socket.remoteAddress || "local";
  const key = `${ip}|${email}`;
  checkLoginThrottle(key);

  const admin = await Admin.findOne({ email }).select("+passwordHash");
  const ok = await bcrypt.compare(password, admin?.passwordHash || DUMMY_HASH);
  if (!admin || !ok) {
    recordLoginFailure(key);
    throw new ApiError(401, "Incorrect email or password");
  }

  clearLoginFailures(key);
  admin.lastLoginAt = new Date();
  await admin.save();
  await setSessionCookie(req, res, admin);
  res.json({ ok: true, name: admin.name });
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

// GET /api/auth/me – the logged-in admin, or 401
router.get("/me", async (req, res) => {
  const session = await readSession(req);
  if (!session) throw new ApiError(401, "Not logged in");
  res.json({ name: session.name, email: session.email, role: session.role });
});

export default router;
