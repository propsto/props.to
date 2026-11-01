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
 * - props.to/<email> → app.props.to/<email>, which redirects to the member's page
 *
 * Reserved paths (e.g., /request-early-access, /api/*) are not rewritten.
 */
const ROOT_FILE =
  /^\/[^/]+\.(?:png|jpe?g|gif|webp|avif|svg|ico|txt|xml|json|webmanifest|css|js|map|woff2?|ttf|otf|pdf)$/i;

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Skip API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Skip static files and Next.js internals. Public files live at the root or
  // under /images and /fonts. Other dotted paths are profiles: member usernames
  // (/acme/john.doe, even /acme/john.js) and emails (/leo@cresteo.com).
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/images/") ||
    ROOT_FILE.test(pathname)
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
  // Compute app URL dynamically based on request host to support preview environments
  // e.g., pr-69.props.build → app.pr-69.props.build
  //       props.to → app.props.to
  const host = request.headers.get("host") ?? "";
  let appUrl: string;

  if (process.env.PROPSTO_APP_URL) {
    // Use env var if explicitly set
    appUrl = process.env.PROPSTO_APP_URL;
  } else if (host.includes(".props.build") || host.includes(".props.to")) {
    // Preview or production - compute app URL from host
    appUrl = `https://app.${host}`;
  } else {
    // Fallback
    appUrl = "https://app.props.to";
  }

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
