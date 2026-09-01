import type { NextRequest } from "next/server";
import { forwardAuthenticated } from "@/lib/server/forward-request";

export async function GET(request: NextRequest) {
  return forwardAuthenticated(request, "/profile");
}
