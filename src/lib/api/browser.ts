import type { ApiEnvelope } from "./contracts";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public errors?: unknown,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || payload.status === false) {
    throw new ApiError(response.status, payload.message || "Permintaan gagal", payload.code, payload.errors);
  }
  return payload;
}
