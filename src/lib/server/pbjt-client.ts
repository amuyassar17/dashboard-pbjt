import "server-only";
import { env } from "./env";

export type UpstreamResult = {
  status: number;
  body: unknown;
};

export async function pbjtRequest(
  path: string,
  options: { method?: string; token?: string; body?: unknown; query?: string } = {},
): Promise<UpstreamResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.PBJT_API_TIMEOUT_MS);
  const url = `${env.PBJT_API_BASE_URL}${path}${options.query ? `?${options.query}` : ""}`;
  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        "Accept-Language": "id",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    });
    return { status: response.status, body: await response.json().catch(() => null) };
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "Layanan PBJT melewati batas waktu"
      : "Layanan PBJT tidak dapat dihubungi";
    return { status: 503, body: { status: false, message } };
  } finally {
    clearTimeout(timeout);
  }
}
