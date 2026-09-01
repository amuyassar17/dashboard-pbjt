import "server-only";
import type { NextRequest } from "next/server";

export function validateMutationRequest(request: NextRequest): Response | null {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return Response.json({ status: false, message: "Content-Type harus application/json" }, { status: 415 });
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return Response.json({ status: false, message: "Origin tidak diizinkan" }, { status: 403 });
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) {
    return Response.json({ status: false, message: "Request lintas situs ditolak" }, { status: 403 });
  }
  return null;
}

export async function parseJsonBody(request: NextRequest): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > 16_384) throw new Error("Payload terlalu besar");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > 16_384) {
    throw new Error("Payload terlalu besar");
  }
  return JSON.parse(text);
}
