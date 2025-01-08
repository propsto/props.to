import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth.edge";

export default function middleware(request: NextRequest): Response {
  return auth(req => {
    if (!req.auth) {
      // eslint-disable-next-line no-console -- temp
      console.log({
        AUTH_URL: process.env.AUTH_URL,
        PROPSTO_APP_URL: process.env.PROPSTO_APP_URL,
      });
      const newUrl = new URL(process.env.AUTH_URL ?? "");
      newUrl.searchParams.set("callbackUrl", request.nextUrl.href);
      return NextResponse.redirect(newUrl.href);
    }
    return NextResponse.next();
  })(request, {}) as Response;
}

export const config = {
  matcher: ["/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
