import { constServer } from "@propsto/constants/server";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth.edge";

/**
 * Dashboard routes that require authentication.
 * Public routes (user profiles, feedback links) are excluded via the matcher.
 */
export default function middleware(request: NextRequest): Response {
  return auth(req => {
    if (!req.auth) {
      const newUrl = new URL(constServer.AUTH_URL);
      newUrl.searchParams.set("callbackUrl", request.nextUrl.href);
      return NextResponse.redirect(newUrl.href);
    }
    return NextResponse.next();
  })(request, { params: Promise.resolve({}) }) as Response;
}

/**
 * Matcher for dashboard routes only.
 * Excludes:
 * - /api/* (API routes)
 * - /_next/* (Next.js internals)
 * - Static files (favicon, etc.)
 * - Public routes (user profiles at /<username>, feedback links)
 *
 * Protected dashboard routes:
 * - / (dashboard home)
 * - /feedback/* (feedback management)
 * - /links/* (feedback links)
 * - /templates/* (templates)
 * - /goals/* (goals)
 */
export const config = {
  matcher: [
    // Dashboard home
    "/",
    // Dashboard routes
    "/feedback/:path*",
    "/links/:path*",
    "/templates/:path*",
    "/goals/:path*",
  ],
};
