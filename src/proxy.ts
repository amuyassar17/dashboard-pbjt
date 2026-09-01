import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/server/auth-cookies";

export function proxy(request: NextRequest) {
  const authenticated = Boolean(request.cookies.get(ACCESS_COOKIE)?.value && request.cookies.get(REFRESH_COOKIE)?.value);
  const login = request.nextUrl.pathname === "/login";
  if (!authenticated && !login) {
    const destination = new URL("/login", request.url);
    destination.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(destination);
  }
  if (authenticated && login) return NextResponse.redirect(new URL("/dashboard", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sptpd/:path*", "/staff/:path*", "/profile/:path*", "/login"],
};
