import Script from "next/script";
import React, { memo, useEffect } from "react";
import { useKonduto } from "@/hooks/states/useKonduto";

interface iKondutoConfig {
  productType: "physical" | "digital";
  nonce: string;
}

export const KondutoConfig = memo(
  function (params: iKondutoConfig) {
    const { productType, nonce } = params;

    const checkKonduto = () => {
      let attempts = 0;
      const maxAttempts = 40;
      const interval = setInterval(() => {
        attempts++;
        if (
          typeof window !== "undefined" &&
          window.Konduto &&
          typeof window.Konduto.getVisitorID === "function"
        ) {
          const id = window.Konduto.getVisitorID();
          useKonduto.setState({ visitorId: id });
          clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 300);
    };

    useEffect(() => {
      checkKonduto();
    }, []);

    return (
      <>
        <Script
          id="konduto-init"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              var __kdt = __kdt || [];
              ${productType === "physical" ? '__kdt.push({"public_key": "PCFCF226F32"});' : '__kdt.push({"public_key": "P5B36A902EC"});'}
              (function() {
                var kdt = document.createElement('script');
                kdt.id = 'kdtjs'; kdt.type = 'text/javascript';
                kdt.async = true;
                kdt.src = 'https://i.k-analytix.com/k.js';
                var s = document.getElementsByTagName('body')[0];
                s.parentNode.insertBefore(kdt, s);
              })();
            `,
          }}
        />
      </>
    );
  },
  (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  },
);
