import { NextResponse, type NextRequest } from "next/server";
import { clearTokenCookies, readTokens } from "@/lib/server/auth-cookies";
import { pbjtRequest } from "@/lib/server/pbjt-client";
import { validateMutationRequest } from "@/lib/server/request-security";

export async function POST(request: NextRequest) {
  const rejected = validateMutationRequest(request);
  if (rejected) return rejected;
  const tokens = readTokens(request);
  if (tokens) await pbjtRequest("/auth/logout", { method: "POST", token: tokens.accessToken });
  const response = NextResponse.json({ status: true, message: "Logout berhasil" });
  clearTokenCookies(response);
  return response;
}
