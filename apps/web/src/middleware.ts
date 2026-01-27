import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isReservedSlug } from "@propsto/constants/other";

/**
 * Middleware to rewrite public profile/feedback URLs to the app.
 *
 * URL patterns:
 * - props.to/<username> → app.props.to/<username>
 * - props.to/<username>/<link-slug> → app.props.to/<username>/<link-slug>
 * - props.to/<org>/<username>/<link-slug> → app.props.to/<org>/<username>/<link-slug>
 *
 * Reserved paths (e.g., /request-early-access, /api/*) are not rewritten.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Skip API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/fonts/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Skip root path
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Extract the first path segment
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return NextResponse.next();
  }

  const firstSegment = segments[0].toLowerCase();

  // Check if the first segment is a reserved slug (web route)
  if (isReservedSlug(firstSegment)) {
    // This is a web route (e.g., /request-early-access, /pricing, etc.)
    return NextResponse.next();
  }

  // Rewrite to the app for user/org profile pages
  const appUrl = process.env.PROPSTO_APP_URL ?? "https://app.props.to";
  const rewriteUrl = new URL(pathname, appUrl);
  rewriteUrl.search = request.nextUrl.search;

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
