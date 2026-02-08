import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    dirs: ["src"],
  },
  compress: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "**" },
      // { protocol: "http", hostname: "**", pathname: "**" },
    ],
  },
};

const sentryWebpackPluginOptions = {
  // silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  telemetry: false,
  silent: true,
  debug: false,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
