import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { NextResponse as ResponseBuilder } from "next/server";
import { authResultSchema, type ApiEnvelope } from "@/lib/api/contracts";
import { clearTokenCookies, readTokens, setTokenCookies } from "./auth-cookies";
import { pbjtRequest } from "./pbjt-client";

const refreshLocks = new Map<string, ReturnType<typeof refreshTokens>>();

function keyFor(token: string) {
  return token.slice(-32);
}

async function refreshTokens(refreshToken: string) {
  const upstream = await pbjtRequest("/auth/refresh", { method: "POST", token: refreshToken });
  if (upstream.status !== 200) return null;
  const parsed = authResultSchema.safeParse((upstream.body as ApiEnvelope<unknown>)?.data);
  if (!parsed.success) return null;
  return { accessToken: parsed.data.accessToken, refreshToken: parsed.data.refreshToken };
}

async function coordinatedRefresh(refreshToken: string) {
  const key = keyFor(refreshToken);
  const existing = refreshLocks.get(key);
  if (existing) return existing;
  const promise = refreshTokens(refreshToken).finally(() => refreshLocks.delete(key));
  refreshLocks.set(key, promise);
  return promise;
}

function jsonResponse(body: unknown, status: number) {
  return ResponseBuilder.json(body ?? { status: false, message: "Response upstream tidak valid" }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function forwardAuthenticated(
  request: NextRequest,
  upstreamPath: string,
  options: { method?: string; body?: unknown; allowRefresh?: boolean } = {},
): Promise<NextResponse> {
  const tokens = readTokens(request);
  if (!tokens) return jsonResponse({ status: false, message: "Sesi tidak tersedia" }, 401);

  const method = options.method ?? "GET";
  let upstream = await pbjtRequest(upstreamPath, {
    method,
    token: tokens.accessToken,
    body: options.body,
    query: method === "GET" ? request.nextUrl.searchParams.toString() : undefined,
  });
  let rotated: { accessToken: string; refreshToken: string } | null = null;

  if (upstream.status === 401 && options.allowRefresh !== false) {
    rotated = await coordinatedRefresh(tokens.refreshToken);
    if (rotated) {
      upstream = await pbjtRequest(upstreamPath, {
        method,
        token: rotated.accessToken,
        body: options.body,
        query: method === "GET" ? request.nextUrl.searchParams.toString() : undefined,
      });
    }
  }

  const response = jsonResponse(upstream.body, upstream.status);
  if (rotated) setTokenCookies(response, rotated);
  if (upstream.status === 401) clearTokenCookies(response);
  return response;
}
