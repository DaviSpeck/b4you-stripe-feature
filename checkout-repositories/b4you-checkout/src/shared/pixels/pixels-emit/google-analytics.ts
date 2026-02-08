import {
  PixelBaseActions,
  PixelEventType,
  ContractDataType,
} from "../pixel-base-actions";

export class GoogleAnalyticsPixel extends PixelBaseActions {
  constructor() {
    super();
  }

  process(event: PixelEventType, payload: ContractDataType): void {
    switch (event) {
      case "initiate-checkout":
        window.gtag("event", "begin_checkout", {
          event_id: payload.eventId,
          value: payload.paymentData?.value,
          currency: "BRL",
          items: payload.items?.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            quantity: item.quantity,
          })),
        });
        break;
      case "add-address-info":
        window.gtag("event", "add_shipping_info", {
          event_id: payload.eventId,
          shipping: payload?.shippingPrice ?? 0,
          items: payload.items?.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            quantity: item.quantity,
          })),
        });
        break;
      case "add-payment-info":
        window.gtag("event", "add_shipping_info", {
          event_id: payload.eventId,
          currency: "BRL",
          value: payload.paymentData?.value,
        });
        break;
      case "generate-bank-slip":
        window.gtag("event", "generated_bank_slip", {
          event_id: payload.eventId,
          currency: "BRL",
          value: payload.paymentData?.value,
          coupon: payload.paymentData?.couponName,
          shipping: payload?.shippingPrice ?? 0,
          items: payload.items?.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            quantity: item.quantity,
          })),
        });
        break;
      case "generate-pix":
        window.gtag("event", "generated_pix", {
          event_id: payload.eventId,
          currency: "BRL",
          value: payload.paymentData?.value,
          coupon: payload.paymentData?.couponName,
          shipping: payload?.shippingPrice ?? 0,
          items: payload.items?.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            quantity: item.quantity,
          })),
        });
        break;
      case "purchase":
        window.gtag("event", "conversion", {
          event_id: payload.eventId,
          transaction_id: payload.saleId,
          currency: "BRL",
          value: payload.paymentData?.value,
          coupon: payload.paymentData?.couponName,
          shipping: payload?.shippingPrice ?? 0,
          items: payload.items?.map((item) => ({
            item_id: item.item_id,
            item_name: item.item_name,
            quantity: item.quantity,
          })),
        });
        break;
    }
  }
}
