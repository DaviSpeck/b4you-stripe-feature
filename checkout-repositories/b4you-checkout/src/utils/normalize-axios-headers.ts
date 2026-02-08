import { AxiosHeaders, AxiosRequestConfig } from "axios";

export function normalizeAxiosHeaders(
  headers?: AxiosRequestConfig["headers"],
): AxiosHeaders {
  const normalized = new AxiosHeaders();

  if (!headers) return normalized;

  if (headers instanceof AxiosHeaders) {
    for (const [k, v] of Object.entries(headers.toJSON())) {
      if (v != null) normalized.set(k, String(v));
    }
    return normalized;
  }

  for (const [k, v] of Object.entries(headers)) {
    if (v != null) normalized.set(k, String(v));
  }

  return normalized;
}