import { NextResponse, type NextRequest } from "next/server";
import {
  changePasswordSchema,
  createStaffSchema,
  resetPasswordSchema,
  updateStaffSchema,
  workflowCommandSchema,
} from "@/lib/api/contracts";
import { clearTokenCookies } from "@/lib/server/auth-cookies";
import { forwardAuthenticated } from "@/lib/server/forward-request";
import { parseJsonBody, validateMutationRequest } from "@/lib/server/request-security";
import type { z } from "zod";

type Allowed = { method: "GET" | "POST" | "PATCH" | "PUT"; path: string; schema?: z.ZodType };

function resolveAllowed(method: string, segments: string[]): Allowed | null {
  const path = `/${segments.join("/")}`;
  if (method === "GET" && ["/summary", "/sptpd", "/simpakdu-history", "/staff", "/profile"].includes(path)) return { method: "GET", path };
  if (method === "GET" && /^\/simpakdu-history\/[^/]+$/.test(path)) return { method: "GET", path };
  if (method === "GET" && /^\/sptpd\/[^/]+(?:\/history)?$/.test(path)) return { method: "GET", path };
  if (method === "POST" && /^\/sptpd\/[^/]+\/(?:verifier\/(?:approve|revision)|kabid\/(?:approve|revision)|simpakdu\/retry)$/.test(path)) {
    return { method: "POST", path, schema: workflowCommandSchema };
  }
  if (method === "POST" && path === "/staff") return { method: "POST", path, schema: createStaffSchema };
  if (method === "PATCH" && /^\/staff\/[^/]+$/.test(path)) return { method: "PATCH", path, schema: updateStaffSchema };
  if (method === "POST" && /^\/staff\/[^/]+\/reset-password$/.test(path)) return { method: "POST", path, schema: resetPasswordSchema };
  if (method === "PUT" && path === "/profile/password") return { method: "PUT", path, schema: changePasswordSchema };
  return null;
}

async function handle(request: NextRequest, context: RouteContext<"/api/pbjt/[...segments]">) {
  const { segments } = await context.params;
  const allowed = resolveAllowed(request.method, segments);
  if (!allowed) return NextResponse.json({ status: false, message: "Endpoint tidak diizinkan" }, { status: 404 });

  let body: unknown;
  if (allowed.method !== "GET") {
    const rejected = validateMutationRequest(request);
    if (rejected) return rejected;
    try {
      const parsed = allowed.schema?.safeParse(await parseJsonBody(request));
      if (!parsed?.success) return NextResponse.json({ status: false, message: "Payload tidak valid" }, { status: 400 });
      body = parsed.data;
    } catch {
      return NextResponse.json({ status: false, message: "Payload tidak valid" }, { status: 400 });
    }
  }

  const response = await forwardAuthenticated(request, allowed.path, { method: allowed.method, body });
  if (allowed.path === "/profile/password" && response.ok) clearTokenCookies(response);
  return response;
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
