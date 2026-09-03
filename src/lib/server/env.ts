import "server-only";
import { z } from "zod";

const envSchema = z.object({
  PBJT_API_BASE_URL: z.string().url().default("http://localhost:8080/v1/pbjt/dashboard"),
  PBJT_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
});

export const env = envSchema.parse({
  PBJT_API_BASE_URL: process.env.PBJT_API_BASE_URL,
  PBJT_API_TIMEOUT_MS: process.env.PBJT_API_TIMEOUT_MS,
});
