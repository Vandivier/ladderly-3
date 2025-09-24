import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Routes we allow this auto-fix on.
 * Keep this list tight so we don't accidentally rewrite unrelated paths.
 * Add additional entries here if other pages are observed with the same issue.
 */
const FIXABLE = [
  "/signup",
  "/signup/interview-prep",
  "/signup/research-backed",
  "/signup/technical-prep",
  "/signup/wellness",
] as const;

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;

  for (const base of FIXABLE) {
    const bad1 = base + "&";
    const bad2 = base + "%26"; // encoded &
    if (p.startsWith(bad1) || p.startsWith(bad2)) {
      const rest = p.slice((p.startsWith(bad1) ? bad1 : bad2).length);
      const to = req.nextUrl.clone();
      to.pathname = base;
      to.search = rest ? `?${rest}` : "";
      return NextResponse.redirect(to, 308);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
