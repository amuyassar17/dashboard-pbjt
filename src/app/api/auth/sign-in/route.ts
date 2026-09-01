import { NextResponse, type NextRequest } from "next/server";
import { apiEnvelopeSchema, authResultSchema, signInSchema } from "@/lib/api/contracts";
import { setTokenCookies } from "@/lib/server/auth-cookies";
import { pbjtRequest } from "@/lib/server/pbjt-client";
import { parseJsonBody, validateMutationRequest } from "@/lib/server/request-security";

export async function POST(request: NextRequest) {
  const rejected = validateMutationRequest(request);
  if (rejected) return rejected;
  try {
    const input = signInSchema.safeParse(await parseJsonBody(request));
    if (!input.success) {
      return NextResponse.json({ status: false, message: "Email atau password tidak valid" }, { status: 400 });
    }
    const upstream = await pbjtRequest("/auth/sign-in", { method: "POST", body: input.data });
    if (upstream.status !== 200) return NextResponse.json(upstream.body, { status: upstream.status });
    const result = apiEnvelopeSchema(authResultSchema).safeParse(upstream.body);
    if (!result.success || !result.data.data) {
      return NextResponse.json({ status: false, message: "Response login tidak valid" }, { status: 502 });
    }
    const response = NextResponse.json({ status: true, message: result.data.message, data: result.data.data.staff });
    setTokenCookies(response, result.data.data);
    return response;
  } catch {
    return NextResponse.json({ status: false, message: "Payload tidak valid" }, { status: 400 });
  }
}
