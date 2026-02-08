import { IncomingMessage } from "http";
import { promisify } from "util";
import * as Sentry from "@sentry/nextjs";
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { HeaderBag, headerContext, sanitize } from "@/utils/header-context";
import { normalizeAxiosHeaders } from "@/utils/normalize-axios-headers";
import { useErrorStore } from "@/context/page-error-redirect";
import { env } from "@/env";

/**
 * ========= CLIENTS =========
 */

export const apiExternal = axios.create({
  baseURL:
    typeof window === "undefined"
      ? `${env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/checkout`
      : "/api/checkout",
});

apiExternal.defaults.withCredentials = true;

export const apiInternal = axios.create({
  baseURL:
    typeof window === "undefined"
      ? `${env.NEXT_PUBLIC_REACT_APP_BASE_URL_INTERNAL}/api`
      : "/api",
});

const sensitiveHeaders = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-access-token",
  "x-auth-token",
]);

const safeHeadersForLog = (
  headers?: AxiosRequestConfig["headers"],
): Record<string, string> => {
  const hdr = normalizeAxiosHeaders(headers);
  const serialized = hdr.toJSON();

  return Object.fromEntries(
    Object.entries(serialized)
      .filter(([key, value]) =>
        value != null && !sensitiveHeaders.has(key.toLowerCase()),
      )
      .map(([k, v]) => [k, String(v)]),
  );
};

const getRequestLogContext = (): {
  requestId?: string;
  forwardedHost?: string;
  forwardedProto?: string;
  pathname?: string;
} => {
  const headers: HeaderBag | undefined = headerContext?.getStore();

  return {
    requestId:
      headers?.["x-request-id"] ??
      headers?.["x-vercel-id"] ??
      headers?.["cf-ray"],
    forwardedHost: headers?.["x-forwarded-host"],
    forwardedProto: headers?.["x-forwarded-proto"],
    pathname: headers?.["x-original-url"] ?? headers?.["x-rewrite-url"],
  };
};

/**
 * ========= BASE URL RESOLUTION (SSR) =========
 */

function resolveInternalBaseURL(): string {
  const headers = headerContext?.getStore();
  const forwardedHost = headers?.["x-forwarded-host"];
  const forwardedProto = headers?.["x-forwarded-proto"] ?? "https";

  if (!forwardedHost) {
    return `${env.NEXT_PUBLIC_REACT_APP_BASE_URL_INTERNAL}/api`;
  }

  return `${forwardedProto}://${forwardedHost}/api`;
}

/**
 * ========= HEADER CONTEXT =========
 */

export function runWithHeaders<T>(
  req: IncomingMessage,
  fn: () => Promise<T> | T,
) {
  if (!headerContext) {
    return fn();
  }

  return headerContext.run(sanitize(req.headers), fn);
}

function attachCtxHeaders(
  cfg: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  if (cfg.skipHeaderContext) {
    return cfg;
  }

  const extra = headerContext?.getStore();

  if (!extra) {
    return cfg;
  }

  if (!hasBrowserContext(extra)) {
    return cfg;
  }

  const hdr = AxiosHeaders.from(cfg.headers || {});
  for (const [k, v] of Object.entries(extra)) hdr.set(k, v);

  cfg.headers = hdr;
  return cfg;
}

function hasBrowserContext(headers: HeaderBag): boolean {
  return Boolean(
    headers.origin ||
      headers.referer ||
      headers["sec-fetch-site"] ||
      headers["sec-fetch-mode"],
  );
}

/**
 * ========= REQUEST INTERCEPTORS =========
 */

apiInternal.interceptors.request.use(attachCtxHeaders);
apiExternal.interceptors.request.use(attachCtxHeaders);

apiInternal.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    cfg.baseURL = "/api";
    return cfg;
  }

  const resolved = resolveInternalBaseURL();
  cfg.baseURL = resolved;

  return cfg;
});

apiExternal.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    cfg.baseURL = "/api/checkout";
    return cfg;
  }

  const hdr = AxiosHeaders.from(cfg.headers || {});
  hdr.set("Accept-Encoding", "identity");
  cfg.headers = hdr;

  if (!cfg.responseType) {
    cfg.responseType = "arraybuffer";
  }

  (cfg as AxiosRequestConfig & { decompress?: boolean }).decompress = false;

  return cfg;
});

/**
 * ========= DECOMPRESSION =========
 */

type Decompressors = {
  gunzipAsync: (buffer: Buffer) => Promise<Buffer>;
  inflateAsync: (buffer: Buffer) => Promise<Buffer>;
  brotliAsync: (buffer: Buffer) => Promise<Buffer>;
  zstdDecompressAsync: ((buffer: Buffer) => Promise<Buffer>) | null;
};

let decompressorsPromise: Promise<Decompressors | null> | null = null;

async function loadDecompressors(): Promise<Decompressors | null> {
  if (typeof window !== "undefined") return null;

  if (!decompressorsPromise) {
    decompressorsPromise = (async () => {
      type ZlibWithZstd = typeof import("zlib") & {
        zstdDecompress?: (
          buffer: Buffer,
          callback: (err: Error | null, result: Buffer) => void,
        ) => void;
      };

      const zlib = (await import("zlib")) as ZlibWithZstd;

      return {
        gunzipAsync: promisify(zlib.gunzip),
        inflateAsync: promisify(zlib.inflate),
        brotliAsync: promisify(zlib.brotliDecompress),
        zstdDecompressAsync:
          typeof zlib.zstdDecompress === "function"
            ? promisify(zlib.zstdDecompress)
            : null,
      };
    })();
  }

  return decompressorsPromise;
}

async function decodeCompressedResponse<T>(response: T) {
  if (typeof window !== "undefined") return response;

  const res = response as { data: unknown; headers?: Record<string, string> };
  const buffer =
    res.data instanceof ArrayBuffer
      ? Buffer.from(res.data)
      : Buffer.isBuffer(res.data)
        ? res.data
        : null;

  if (!buffer) return response;

  const headers = res.headers ?? {};
  const enc = headers["content-encoding"];

  const decompressors = await loadDecompressors();
  if (!decompressors) return response;

  let decoded = buffer;

  if (enc?.includes("gzip")) decoded = await decompressors.gunzipAsync(buffer);
  if (enc?.includes("br")) decoded = await decompressors.brotliAsync(buffer);

  const text = decoded.toString("utf-8");

  if (headers["content-type"]?.includes("application/json")) {
    try {
      res.data = JSON.parse(text);
      return res as T;
    } catch {
    }
  }

  res.data = text;
  return res as T;
}

/**
 * ========= ERROR HANDLER =========
 */

const errorHandler = (error: AxiosError) => {
  const status = error.response?.status ?? 0;
  const cfg: AxiosRequestConfig | undefined = error.config;

  useErrorStore.setState({ isServerError: status >= 500 });

  Sentry.withScope((scope) => {
    scope.setContext("axios", {
      method: cfg?.method,
      baseURL: cfg?.baseURL,
      url: cfg?.url,
      status,
      responseHeaders: safeHeadersForLog(error.response?.headers),
    });
    Sentry.captureException(error);
  });

  return Promise.reject(error);
};

apiInternal.interceptors.response.use((r) => r, errorHandler);
apiExternal.interceptors.response.use(decodeCompressedResponse, errorHandler);

export { headerContext, sanitize };