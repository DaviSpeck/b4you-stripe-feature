import Script from "next/script";
import React, { memo } from "react";
import { v4 as uuid } from "uuid";

interface iParams {
  pixels: { pixel_id: string }[];
  nonce: string;
}

export const GooglePixelConfig = memo(
  function (params: iParams) {
    const { pixels, nonce } = params;

    const tagIds = pixels?.map((p) => p.pixel_id)
      .filter((id) => id?.startsWith("G-") || id?.startsWith("AW-"));

    const gtmIds = pixels?.map((p) => p.pixel_id)
      .filter((id) => id?.startsWith("GTM-"));

    return (
      <React.Fragment key={uuid()}>
        <Script
          id="gtag-pixel-init"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            function gtm(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),
                dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            }

            ${tagIds.map((id) => `gtag('config', '${id}');`).join("\n")}
            ${gtmIds.map((id) => `gtm(window,document,'script','dataLayer','${id}')`).join("\n")}
          `,
          }}
        />

        {tagIds.map((id) => (
          <Script
            key={uuid()}
            nonce={nonce}
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
          />
        ))}

        {gtmIds.map((id) => (
          <noscript key={uuid()}>
            <iframe
              className="hidden"
              src={`https://www.googletagmanager.com/ns.html?id=${id}`}
              nonce={nonce}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>
        ))}
      </React.Fragment>
    );
  },
  (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  },
);
