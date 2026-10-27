// Create an admin, or reset an existing admin's password.
//
//   npm run create-admin -- <email> <password> ["Full Name"] [owner|staff]
//
// Example:
//   npm run create-admin -- karma@cst.edu.bt "S3cure!Pass" "Karma Dorji" staff
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../src/models/Admin.js";

const [email, password, name = "Café Admin", role = "owner"] = process.argv.slice(2);

if (!email || !password) {
  console.log('Usage: npm run create-admin -- <email> <password> ["Full Name"] [owner|staff]');
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
if (!["owner", "staff"].includes(role)) {
  console.error('Role must be "owner" or "staff".');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
await Admin.init();
const passwordHash = await bcrypt.hash(password, 12);
const existing = await Admin.findOne({ email: email.toLowerCase() });
if (existing) {
  existing.passwordHash = passwordHash;
  existing.name = name;
  existing.role = role;
  await existing.save();
  console.log(`✔ Updated admin ${email.toLowerCase()} (password reset)`);
} else {
  await Admin.create({ email: email.toLowerCase(), passwordHash, name, role });
  console.log(`✔ Created admin ${email.toLowerCase()}`);
}
await mongoose.disconnect();
