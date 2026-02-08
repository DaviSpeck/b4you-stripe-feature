import { env } from "@/env";

type ServerFetchOptions = {
  timeoutMs?: number;
  headers?: Record<string, string>;
};

type ServerFetchResponse<T> = {
  status: number;
  ok: boolean;
  data: T;
};

async function parseJsonOrText<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return "" as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export async function postExternalJson<TResponse>(
  path: string,
  body: unknown,
  options: ServerFetchOptions = {},
): Promise<ServerFetchResponse<TResponse>> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 20000,
  );

  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/checkout${path}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "identity",
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );

    const data = await parseJsonOrText<TResponse>(response);
    return { status: response.status, ok: response.ok, data };
  } finally {
    clearTimeout(timeout);
  }
}
