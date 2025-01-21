import { constServer } from "@propsto/constants/server";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth.edge";

export default function middleware(request: NextRequest): Response {
  return auth(req => {
    if (!req.auth) {
      const newUrl = new URL(constServer.AUTH_URL);
      newUrl.searchParams.set("callbackUrl", request.nextUrl.href);
      return NextResponse.redirect(newUrl.href);
    }
    return NextResponse.next();
  })(request, {}) as Response;
}

export const config = {
  matcher: ["/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
