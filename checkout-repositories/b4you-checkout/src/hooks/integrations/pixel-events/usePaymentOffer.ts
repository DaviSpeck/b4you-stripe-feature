import Cookies from "js-cookie";
import { iOffer, PaymentTypes } from "@/interfaces/offer";
import { ContractDataType } from "@/shared/pixels/pixel-base-actions";
import { FacebookPixel } from "@/shared/pixels/pixels-emit/facebook";
import { GoogleAdsPixel } from "@/shared/pixels/pixels-emit/google-ads";
import { GoogleAnalyticsPixel } from "@/shared/pixels/pixels-emit/google-analytics";
import { PinterestPixel } from "@/shared/pixels/pixels-emit/pinterest";
import { TikTokPixel } from "@/shared/pixels/pixels-emit/tiktok";

interface iProps {
  offerData: iOffer;
  paymentSelect: PaymentTypes;
}

export function usePaymentEvents(props: iProps) {
  const facebookPixel = new FacebookPixel();
  const googleAnalyticsPixel = new GoogleAnalyticsPixel();
  const googleAdsPixel = new GoogleAdsPixel();
  const tiktokPixel = new TikTokPixel();
  const pinterestPixel = new PinterestPixel();

  const { offerData, paymentSelect } = props;

  function onGenerate(payload: ContractDataType) {
    if (!offerData) return;

    const isEventCookieController = Cookies.get(`event-on-generate-paid`);

    if (isEventCookieController) return;

    Cookies.set(`event-on-generate-paid`, "true");

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

    const generateType =
      payload.paymentData?.method === "BANK_SLIP"
        ? "generate-bank-slip"
        : "generate-pix";

    offerData?.pixels?.facebook?.forEach(({ settings }) => {
      facebookPixel.emitEvent({
        event: generateType,
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
          items: itensArr,
        },
      });

      if (settings.generated_pix || settings.generated_billet) {
        facebookPixel.emitEvent({
          event: "purchase",
          payload: {
            ...payload,
            pixelId: settings.pixel_id,
            items: itensArr,
          },
        });
      }
    });

    offerData?.pixels["google-ads"]?.forEach(({ settings }) => {
      googleAdsPixel.emitEvent({
        event: generateType,
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
          items: itensArr,
        },
      });

      if (settings.trigger_boleto || settings.trigger_pix) {
        googleAdsPixel.emitEvent({
          event: "purchase",
          payload: {
            ...payload,
            pixelId: settings.pixel_id,
            items: itensArr,
          },
        });
      }
    });

    offerData?.pixels?.tiktok?.forEach(({ settings }) => {
      tiktokPixel.emitEvent({
        event: generateType,
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
          items: itensArr,
          offerInformations: {
            uuid: offerData.uuid,
            type: offerData.product.type === "physical" ? "product" : "plan",
          },
        },
      });

      if (settings.trigger_purchase_boleto) {
        tiktokPixel.emitEvent({
          event: "purchase",
          payload: {
            ...payload,
            pixelId: settings.pixel_id,
            items: itensArr,
            offerInformations: {
              uuid: offerData.uuid,
              type: offerData.product.type === "physical" ? "product" : "plan",
            },
          },
        });
      }
    });

    offerData?.pixels["google-analytics"]?.forEach(({ settings }) => {
      googleAnalyticsPixel.emitEvent({
        event: generateType,
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
          items: itensArr,
        },
      });
    });

    offerData?.pixels?.tiktok?.forEach(({ settings }) => {
      pinterestPixel.emitEvent({
        event: generateType,
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
          items: itensArr,
        },
      });
    });
  }

  function uponCompleted(payload: ContractDataType) {
    if (!offerData) return;

    if (paymentSelect === "CARD") {
      Cookies.remove(`event-on-generate-paid`);
      Cookies.remove(`initiate-checkout`);
    }

    offerData?.pixels?.facebook?.forEach(({ settings }) => {
      facebookPixel.emitEvent({
        event: "purchase",
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
        },
      });
    });

    offerData?.pixels?.pinterest?.forEach(({ settings }) => {
      pinterestPixel.emitEvent({
        event: "purchase",
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
        },
      });
    });

    offerData?.pixels?.tiktok?.forEach(({ settings }) => {
      tiktokPixel.emitEvent({
        event: "purchase",
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

    offerData?.pixels["google-ads"]?.forEach(({ settings }) => {
      googleAdsPixel.emitEvent({
        event: "purchase",
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
        },
      });
    });

    offerData?.pixels["google-analytics"]?.forEach(({ settings }) => {
      googleAnalyticsPixel.emitEvent({
        event: "purchase",
        payload: {
          ...payload,
          pixelId: settings.pixel_id,
        },
      });
    });
  }

  return {
    onGenerate,
    uponCompleted,
  };
}
