// API URL detection: desktop app uses a fixed local server port
// Use 127.0.0.1 (not localhost) to match the backend bind address and avoid
// IPv6 resolution issues on Windows where localhost may resolve to ::1
export const API_URL =
  typeof window !== "undefined" && window.electronAPI
    ? "http://127.0.0.1:17384"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Default timeout for API requests (30 seconds). */
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Fetch wrapper with timeout support and user-friendly error messages.
 * Returns the Response on success; throws a descriptive Error on failure.
 */
export async function apiFetch(
  url: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchInit } = init ?? {};

  const controller = new AbortController();
  // Merge external signal so callers can still abort independently
  if (fetchInit.signal) {
    fetchInit.signal.addEventListener("abort", () => controller.abort());
  }
  fetchInit.signal = controller.signal;

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, fetchInit);
    return res;
  } catch (err: unknown) {
    if (controller.signal.aborted && !(init?.signal?.aborted)) {
      throw new Error(
        "The request timed out. The server may be busy — please try again.",
      );
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err; // Caller-initiated abort, re-throw as-is
    }
    throw new Error(
      "Could not reach the server. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse an error response body and throw with the detail message.
 * Use after checking `!res.ok`.
 */
export async function throwResponseError(res: Response): Promise<never> {
  const data = await res.json().catch(() => ({}));
  const detail = (data as Record<string, unknown>).detail;

  if (res.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }
  if (res.status >= 500) {
    throw new Error(
      typeof detail === "string"
        ? detail
        : "The server encountered an error. Please try again.",
    );
  }
  throw new Error(
    typeof detail === "string" ? detail : `Request failed (${res.status})`,
  );
}
