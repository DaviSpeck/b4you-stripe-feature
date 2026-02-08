import { env } from "@/env";

export const normalizeOrigin = (origin: string) => {
  const normalized = origin.replace(/^https?:\/\//, "").toLowerCase();

  return normalized;
};

const splitOrigins = (value?: string) => {
  const list =
    value
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  return list;
};

export const getAllowedOrigins = (): string[] => {
  const internalBaseURL = env.NEXT_PUBLIC_REACT_APP_BASE_URL_INTERNAL;
  const envAllowed = env.NEXT_PUBLIC_CORS_ALLOWED_ORIGINS;

  const origins = [internalBaseURL, ...splitOrigins(envAllowed)]
    .filter(Boolean)
    .map(normalizeOrigin);

  return origins;
};
