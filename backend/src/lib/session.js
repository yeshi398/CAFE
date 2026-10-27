// JWT helpers using `jose`. No Node-only imports, so the proxy can use them too.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "cst_admin_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters long.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload, hours) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("cst-cafe")
    .setExpirationTime(`${hours}h`)
    .sign(getSecret());
}

/** Returns the session payload, or null if missing/expired/tampered. */
export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer: "cst-cafe", algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}
