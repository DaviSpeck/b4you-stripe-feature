import Script from "next/script";
import React, { memo } from "react";
import { v4 as uuid } from "uuid";
import { iPinterest } from "@/interfaces/pixel";

interface iParams {
  pixels: iPinterest[];
}

export const PinterestPixelConfig = memo(
  function (params: iParams) {
    const { pixels } = params;

    return (
      <React.Fragment>
        <Script
          id="pinterest-pixel-script"
          dangerouslySetInnerHTML={{
            __html: `
                 !function(e){if(!window.pintrk){window.pintrk = function () {
                  window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
                  n=window.pintrk;n.queue=[],n.version="3.0";var
                  t=document.createElement("script");t.async=!0,t.src=e;var
                  r=document.getElementsByTagName("script")[0];
                  r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
                  ${pixels
                    ?.map(
                      (pixel) =>
                        `window.pintrk('load', ${pixel.settings.pixel_id}, {em: '<user_email_address>'});`,
                    )
                    .join("\n")}
                  window.pintrk('page');
                `,
          }}
        />
        {pixels?.map((pixel) => (
          <noscript key={uuid()}>
            <img
              height="1"
              width="1"
              className="bg-transparent"
              alt=""
              src={`https://ct.pinterest.com/v3/?event=init&tid=${pixel.settings.pixel_id}&pd[em]=<hashed_email_address>&noscript=1`}
            />
          </noscript>
        ))}
      </React.Fragment>
    );
  },
  (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  },
);
