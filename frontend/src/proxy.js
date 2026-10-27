import { NextResponse } from "next/server";

/**
 * Quick check before any /admin page: no login cookie → go to the login page.
 * The real check happens on the backend – every /api/admin request is verified
 * there, and admin/(panel)/layout.js asks the backend who is logged in.
 */
export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (request.cookies.get("cst_admin_session")?.value) return NextResponse.next();

  const url = new URL("/admin/login", request.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
