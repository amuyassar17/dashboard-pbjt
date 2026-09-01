import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { status: "ok", service: "pbjt-dashboard" },
    { headers: { "Cache-Control": "no-store" } },
  );
}

