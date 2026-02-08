import "@/styles/globals.css";
import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary } from "@sentry/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { ErrorFallback } from "@/components/fallbacks/error-fallback";
import { PageErrorObserverProvider } from "@/context/page-error-redirect";
import { env } from "@/env";
import { Toaster } from "@/components/ui/sonner";

if (typeof window !== "undefined") {
  const hostname = window.location.hostname;
  const hasDebug = window.location.search.includes("debug=1");

  const isDev =
    env.NEXT_PUBLIC_NODE_ENV === "dev" ||
    hostname === "localhost" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    hostname.includes("sandbox");

  if ((isDev || hasDebug) && !window.__ERUDA__) {
    import("eruda").then((eruda) => {
      eruda.default.init();
      window.__ERUDA__ = true;
    });
  }
}

export const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const routesWithProgress = [
      "/pix",
      "/upsell",
      "/upsell-native",
      "/payment-thanks",
    ];

    const handleStart = (url: string) => {
      if (!routesWithProgress.some((path) => url.startsWith(path))) return;
      setIsPageLoading(true);
    };

    const handleStop = () => setIsPageLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  return (
    <main translate="no">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <PageErrorObserverProvider>
            <ErrorBoundary
              fallback={<ErrorFallback />}
              onError={(error, componentStack) => {
                Sentry.captureException(error, {
                  extra: { componentStack },
                });
              }}
            >
              {isPageLoading && (
                <div className="absolute z-50 flex h-screen w-full items-center justify-center bg-[#0000008f]">
                  <AiOutlineLoading3Quarters
                    size={30}
                    className="animate-spin"
                  />
                </div>
              )}
              <Component {...pageProps} />
            </ErrorBoundary>
          </PageErrorObserverProvider>

          <Toaster position="top-right" />
        </NuqsAdapter>
      </QueryClientProvider>
    </main>
  );
}
