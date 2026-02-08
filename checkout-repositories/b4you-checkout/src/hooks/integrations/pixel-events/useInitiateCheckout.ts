import Cookies from "js-cookie";
import { iOffer } from "@/interfaces/offer";
import { ContractDataType } from "@/shared/pixels/pixel-base-actions";
import { FacebookPixel } from "@/shared/pixels/pixels-emit/facebook";
import { GoogleAdsPixel } from "@/shared/pixels/pixels-emit/google-ads";
import { GoogleAnalyticsPixel } from "@/shared/pixels/pixels-emit/google-analytics";
import { PinterestPixel } from "@/shared/pixels/pixels-emit/pinterest";
import { TikTokPixel } from "@/shared/pixels/pixels-emit/tiktok";

const cookies = [
  "add-payment-info",
  "add-address-info",
  "payment-upon-generate-payment-data",
  "event-on-generate-paid",
];

export function useInitiateCheckoutEvent(offerData: iOffer) {
  const facebookPixel = new FacebookPixel();
  const tiktokPixel = new TikTokPixel();
  const pinterestPixel = new PinterestPixel();
  const googleAnalyticsPixel = new GoogleAnalyticsPixel();
  const googleAdsPixel = new GoogleAdsPixel();

  function handler(payload: ContractDataType) {
    if (!offerData) return;

    const isInitiateCheckout = Cookies.get("initiate-checkout");

    if (
      isInitiateCheckout ||
      typeof window.fbq !== "function" ||
      typeof window.ttq !== "object" ||
      typeof window.pintrk !== "function" ||
      typeof window.gtag !== "function"
    ) {
      return;
    }

    const expirationDate = new Date(new Date().getTime() + 15 * 60 * 1000);

    cookies.forEach((cookieName) => Cookies.remove(cookieName));

    Cookies.set("initiate-checkout", offerData!.uuid, {
      expires: expirationDate,
    });

    let itensArr: { item_id: string; item_name: string; quantity: number }[] = [
      {
        item_id: offerData!.uuid,
        item_name: payload.offerInformations?.name ?? "",
        quantity: offerData!.quantity,
      },
    ];

    if (Array.isArray(offerData!.offerShopify)) {
      itensArr = offerData!.offerShopify.map((item) => ({
        item_id: String(item.variant_id),
        item_name: item.title,
        quantity: item.quantity,
      }));
    }

    offerData?.pixels?.facebook?.forEach(({ settings }) => {
      facebookPixel.emitEvent({
        event: "initiate-checkout",
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
          items: itensArr,
        },
      });
    });

    offerData?.pixels?.tiktok?.forEach(({ settings }) => {
      tiktokPixel.emitEvent({
        event: "initiate-checkout",
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
          offerInformations: {
            uuid: offerData.uuid,
            type: offerData.product.type === "physical" ? "product" : "plan",
          },
        },
      });
    });

    offerData?.pixels?.pinterest?.forEach(({ settings }) => {
      pinterestPixel.emitEvent({
        event: "initiate-checkout",
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
        },
      });
    });

    offerData?.pixels["google-ads"]?.forEach(({ settings }) => {
      googleAdsPixel.emitEvent({
        event: "initiate-checkout",
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
          label: settings.label,
        },
      });
    });

    offerData?.pixels["google-analytics"]?.forEach(({ settings }) => {
      googleAnalyticsPixel.emitEvent({
        event: "initiate-checkout",
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
        },
      });
    });
  }

  return { handler };
}
