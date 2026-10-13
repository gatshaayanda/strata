import { NextResponse, type NextRequest } from "next/server";

// The Plug's inherited customer/admin screens are not Strata workflows.
// Keep those routes out of the public Strata journey until their replacements exist.
const legacyRoutes = new Set(["/request", "/book", "/account", "/saved", "/admin", "/invite"]);

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  if (legacyRoutes.has(pathname) || pathname.startsWith("/admin/")) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/";
    destination.search = "";
    destination.hash = "";
    return NextResponse.redirect(destination, 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|sw.js|strata-icon.svg|strata-assets/).*)"],
};
