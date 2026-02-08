import {
  ContractDataType,
  PixelBaseActions,
  PixelEventType,
} from "../pixel-base-actions";

export class FacebookPixel extends PixelBaseActions {
  constructor() {
    super();
  }

  process(event: PixelEventType, payload: ContractDataType): void {
    switch (event) {
      case "initiate-checkout":
        window.fbq("track", "InitiateCheckout", {
          event_id: payload.eventId,
          currency: "BRL",
          content_ids: payload.items?.map((item) => item.item_id),
          contents: payload.items?.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
        break;
      case "add-address-info":
        window.fbq("trackCustom", "AddAddressInfo", {
          event_id: payload.eventId,
          content_ids: payload.items?.map((item) => item.item_id),
          contents: payload.items?.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
        break;
      case "add-payment-info":
        window.fbq("track", "AddPaymentInfo", {
          event_id: payload.eventId,
          value: payload.paymentData?.value,
          currency: payload.paymentData?.currency,
          coupon: payload.paymentData?.couponName ?? null,
          content_type: "product",
          content_ids: payload.items?.map((item) => item.item_id),
          contents: payload.items?.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
        break;
      case "generate-bank-slip":
        window.fbq("trackCustom", "GeneratedPix", {
          event_id: payload.eventId,
          value: payload.paymentData?.value,
          currency: payload.paymentData?.currency,
          content_type: "product",
          content_ids: payload.items?.map((item) => item.item_id),
          contents: payload.items?.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
        break;
      case "generate-pix":
        window.fbq("trackCustom", "GeneratedPix", {
          event_id: payload.eventId,
          value: payload.paymentData?.value,
          currency: payload.paymentData?.currency,
          content_type: "product",
          content_ids: payload.items?.map((item) => item.item_id),
          contents: payload.items?.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
        break;
      case "purchase":
        window.fbq("track", "Purchase", {
          event_id: payload.eventId,
          order_id: payload.saleId,
          value: payload.paymentData?.value,
          currency: payload.paymentData?.currency,
          content_type: "product",
          content_ids: payload.items?.map((item) => item.item_id),
          contents: payload.items?.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
        break;
    }
  }
}
