import { constServer } from "@propsto/constants/server";
import { isReservedSlug } from "@propsto/constants/other";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth.edge";

/**
 * Middleware for app authentication.
 *
 * Routes are protected based on reserved slugs:
 * - Reserved slugs (feedback, templates, links, goals, etc.) require authentication
 * - Non-reserved paths (/<username>, /<username>/<link>) are public profile pages
 */
export default function middleware(request: NextRequest): Response {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Root path requires auth (dashboard home)
  if (pathname === "/") {
    return requireAuth(request);
  }

  // Check if first segment is a reserved slug (dashboard route)
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isReservedSlug(segments[0])) {
    return requireAuth(request);
  }

  // All other paths are public (user profiles, feedback links)
  return NextResponse.next();
}

function requireAuth(request: NextRequest): Response {
  return auth(req => {
    if (!req.auth) {
      const newUrl = new URL(constServer.AUTH_URL);
      newUrl.searchParams.set("callbackUrl", request.nextUrl.href);
      return NextResponse.redirect(newUrl.href);
    }
    return NextResponse.next();
  })(request, { params: Promise.resolve({}) }) as Response;
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
