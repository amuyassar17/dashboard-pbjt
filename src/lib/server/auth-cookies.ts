import "server-only";
import type { NextRequest, NextResponse } from "next/server";

export const ACCESS_COOKIE = "pbjt_access";
export const REFRESH_COOKIE = "pbjt_refresh";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export type Tokens = { accessToken: string; refreshToken: string };

export function readTokens(request: NextRequest): Tokens | null {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export function setTokenCookies(response: NextResponse, tokens: Tokens) {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions);
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);
}

export function clearTokenCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
