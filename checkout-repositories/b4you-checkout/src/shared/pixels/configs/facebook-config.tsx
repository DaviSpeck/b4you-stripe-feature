import Script from "next/script";
import React, { memo } from "react";
import { v4 as uuid } from "uuid";
import { iFacebookPixels } from "@/interfaces/pixel";

interface iFacebookPixelConfig {
  pixels: iFacebookPixels[];
  nonce: string;
}

export const FacebookPixelConfig = memo(
  function (params: iFacebookPixelConfig) {
    const { pixels, nonce } = params;

    return (
      <React.Fragment key={uuid()}>
        <Script
          id={"fb-pixel-script"}
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              ${pixels?.map(({ settings }) => `window.fbq("init", '${settings.pixel_id}');`).join("\n")}
            `,
          }}
        />
        {pixels?.map(({ settings }) => (
          <React.Fragment key={uuid()}>
            <noscript key={uuid()}>
              <img
                nonce={nonce}
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${settings.pixel_id}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </React.Fragment>
        ))}
      </React.Fragment>
    );
  },
  (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  },
);
