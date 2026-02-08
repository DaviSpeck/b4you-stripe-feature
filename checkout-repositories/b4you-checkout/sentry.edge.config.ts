import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1,
  // debug: process.env.NEXT_PUBLIC_NODE_ENV !== "production",
  enabled: process.env.NEXT_PUBLIC_NODE_ENV === "production"
});
