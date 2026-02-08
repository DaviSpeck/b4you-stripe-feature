import { NextRequest, NextResponse } from "next/server";
import { env } from "./env";
import { getAllowedOrigins } from "./utils/cors";

/**
 * CSP permissivo apenas para DEV (inclui preview da Vercel)
 */
function CSPDev(): string {
  return `
    default-src 'self';

    script-src
      'self'
      'unsafe-inline'
      'unsafe-eval'
      blob:
      data:
      https://vercel.live
      https://*.vercel.live
      https://*.vercel.app
      https://challenges.cloudflare.com
      https://*.cloudflare.com
      https://connect.facebook.net
      https://s.pinimg.com
      https://ct.pinterest.com
      https://analytics.tiktok.com
      https://i.k-analytix.com
      https://www.googletagmanager.com
      https://www.google-analytics.com
      https://www.googleadservices.com
      https://googleads.g.doubleclick.net
      https://stats.g.doubleclick.net
    ;

    script-src-elem
      'self'
      'unsafe-inline'
      'unsafe-eval'
      blob:
      data:
      https://vercel.live
      https://*.vercel.live
      https://*.vercel.app
      https://challenges.cloudflare.com
      https://*.cloudflare.com
      https://connect.facebook.net
      https://s.pinimg.com
      https://ct.pinterest.com
      https://analytics.tiktok.com
      https://i.k-analytix.com
      https://www.googletagmanager.com
      https://www.google-analytics.com
      https://www.googleadservices.com
      https://googleads.g.doubleclick.net
      https://stats.g.doubleclick.net
    ;

    style-src
      'self'
      'unsafe-inline'
      https://fonts.googleapis.com
    ;

    style-src-elem
      'self'
      'unsafe-inline'
      https://fonts.googleapis.com
    ;

    font-src
      'self'
      https://fonts.gstatic.com
      data:
    ;

    img-src
      *
      data:
      blob:
    ;

    media-src *;

    connect-src
      *
      https://vercel.live
      https://*.vercel.app
      https://api.pagar.me
      https://*.pagar.me
      https://*.ingest.us.sentry.io
      https://analytics.tiktok.com
      https://ct.pinterest.com
      https://www.google-analytics.com
      https://www.googletagmanager.com
      https://www.googleadservices.com
      https://stats.g.doubleclick.net
      https://googleads.g.doubleclick.net
    ;

    frame-src
      *
      https://vercel.live
      https://*.vercel.app
      https://challenges.cloudflare.com
      https://www.facebook.com
      https://www.youtube.com
      https://www.googletagmanager.com
    ;
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * CSP de PRODUÇÃO
 * Ajustado para trackers, antifraude e Cloudflare Turnstile
 */
function CSP(): { cspHeader: string } {
  const cspHeader = `
    default-src 'none';

    script-src
      'self'
      'unsafe-inline'
      'unsafe-eval'
      blob:
      data:
      https://challenges.cloudflare.com
      https://*.cloudflare.com
      https://connect.facebook.net
      https://s.pinimg.com
      https://ct.pinterest.com
      https://analytics.tiktok.com
      https://i.k-analytix.com
      https://www.googletagmanager.com
      https://www.google-analytics.com
      https://www.googleadservices.com
      https://googleads.g.doubleclick.net
      https://stats.g.doubleclick.net
      https://www.youtube.com
      https://vercel.live
      https://*.vercel.live
    ;

    script-src-elem
      'self'
      'unsafe-inline'
      'unsafe-eval'
      blob:
      data:
      https://challenges.cloudflare.com
      https://*.cloudflare.com
      https://connect.facebook.net
      https://s.pinimg.com
      https://ct.pinterest.com
      https://analytics.tiktok.com
      https://i.k-analytix.com
      https://www.googletagmanager.com
      https://www.google-analytics.com
      https://www.googleadservices.com
      https://googleads.g.doubleclick.net
      https://stats.g.doubleclick.net
      https://www.youtube.com
      https://vercel.live
      https://*.vercel.live
    ;

    worker-src
      'self'
      blob:
    ;

    style-src
      'self'
      'unsafe-inline'
      https://fonts.googleapis.com
    ;

    style-src-elem
      'self'
      'unsafe-inline'
      https://fonts.googleapis.com
    ;

    font-src
      'self'
      https://fonts.gstatic.com
      data:
    ;

    img-src
      'self'
      blob:
      data:
      https://cdn.shopify.com
      https://*.shopify.com
      https://api.pagar.me
      https://*.pagar.me
      https://www.googleadservices.com
      https://googleads.g.doubleclick.net
      https://stats.g.doubleclick.net
      https://www.googletagmanager.com
      https://www.google.com
      https://www.google.com.br
      https://www.facebook.com
      https://ct.pinterest.com
      https://s.pinimg.com
      https://arquivos-mango5.s3.sa-east-1.amazonaws.com
    ;

    media-src
      'self'
      https://www.youtube.com
      https://*.googlevideo.com
    ;

    connect-src
      'self'
      https://api-checkout.b4you.com.br
      https://*.b4you.com.br
      https://pay.b4you.com.br
      https://sandbox-checkout-ts.b4you.com.br
      https://checkout-ts.b4you.com.br
      https://api.pagar.me
      https://*.pagar.me
      https://challenges.cloudflare.com
      https://*.cloudflare.com
      https://www.google.com
      https://www.google.com.br
      https://www.google-analytics.com
      https://analytics.google.com
      https://www.googletagmanager.com
      https://www.googleadservices.com
      https://d.clarity.ms
      https://i.konduto.com
      https://analytics.tiktok.com
      https://ct.pinterest.com
      https://*.run.app
      https://*.us-central1.run.app
      https://*.ingest.us.sentry.io
      https://viacep.com.br
      https://vercel.live
      https://*.vercel.live
    ;

    frame-src
      'self'
      https://challenges.cloudflare.com
      https://www.facebook.com
      https://www.youtube.com
      https://www.googletagmanager.com
    ;

    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    object-src 'none';

    upgrade-insecure-requests;
  `;

  return {
    cspHeader: cspHeader.replace(/\s{2,}/g, " ").trim(),
  };
}

/**
 * CORS
 */
function Cors(req: NextRequest): { allowedOrigin: boolean } {
  const allowedOrigins = getAllowedOrigins();

  const origin = req.headers.get("origin")?.toLowerCase();
  const proto = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || "";

  const computedHost = `${proto}://${host}`
    .replace(/^https?:\/\//, "")
    .toLowerCase();

  const normalizedOrigin = origin
    ? origin.replace(/^https?:\/\//, "").toLowerCase()
    : "";

  const isSameHost = normalizedOrigin
    ? normalizedOrigin === computedHost
    : false;

  const isValidOrigin = origin
    ? isSameHost || allowedOrigins.includes(normalizedOrigin)
    : true;

  const isValidHost = computedHost
    ? allowedOrigins.includes(computedHost)
    : true;

  if (origin) return { allowedOrigin: isValidOrigin };
  return { allowedOrigin: isValidHost };
}

export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  const origin = req.headers.get("origin");
  const proto = req.headers.get("x-forwarded-proto");
  const xfHost = req.headers.get("x-forwarded-host");

  const isDevLike =
    env.NEXT_PUBLIC_NODE_ENV === "dev" ||
    req.nextUrl.hostname.includes("sandbox") ||
    req.nextUrl.hostname.includes("vercel");

  const isHttps =
    proto === "https" || req.nextUrl.protocol === "https:";

  /**
   * CORS
   */
  if (req.nextUrl.pathname.startsWith("/api")) {
    const { allowedOrigin } = Cors(req);

    if (!allowedOrigin) {
      return NextResponse.json(
        { error: "Forbidden origin" },
        { status: 403 },
      );
    }
  }

  /**
   * CSP
   */
  if (isDevLike) {
    response.headers.set("Content-Security-Policy", CSPDev());
  } else if (isHttps) {
    response.headers.set("Content-Security-Policy", CSP().cspHeader);
  } else {
    response.headers.set(
      "Content-Security-Policy",
      CSP().cspHeader.replace("upgrade-insecure-requests;", ""),
    );
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
