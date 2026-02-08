import * as Sentry from "@sentry/nextjs";

export async function withErrorCapture<T>(
    fn: () => Promise<T>,
    fallback?: T | ((error: unknown) => T),
): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        Sentry.captureException(err);
        if (typeof fallback === "function") {
            return (fallback as (e: unknown) => T)(err);
        }
        return fallback as T;
    }
}