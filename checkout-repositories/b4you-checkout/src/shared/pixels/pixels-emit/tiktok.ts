import {
  ContractDataType,
  PixelBaseActions,
  PixelEventType,
} from "../pixel-base-actions";

export class TikTokPixel extends PixelBaseActions {
  constructor() {
    super();
  }

  process(event: PixelEventType, payload?: ContractDataType): void {
    switch (event) {
      case "initiate-checkout":
        window.ttq.track("InitiateCheckout", {
          event_id: payload?.eventId,
          content_id: payload?.offerInformations?.uuid,
          content_type: payload?.offerInformations?.type,
          value: payload?.paymentData?.value,
          currency: "BRL",
          content_ids: payload?.items?.map((item) => item.item_id),
          contents: payload?.items?.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
        break;
      case "add-address-info":
        window.ttq.track("AddAddressInfo", {
          event_id: payload?.eventId,
          content_id: payload?.offerInformations?.uuid,
          content_type: payload?.offerInformations?.type,
          value: payload?.paymentData?.value,
          currency: "BRL",
          shipping_address: {
            street: payload?.addressData?.street,
            city: payload?.addressData?.city,
            state: payload?.addressData?.region,
            country: payload?.addressData?.country,
            zip: payload?.addressData?.zip,
          },
        });
        break;
      case "add-payment-info":
        window.ttq.track("AddPaymentInfo", {
          event_id: payload?.eventId,
          content_id: payload?.offerInformations?.uuid,
          content_type: payload?.offerInformations?.type,
          payment_type: "credit_card",
          value: payload?.paymentData?.value,
          currency: "BRL",
        });
        break;
      case "generate-bank-slip":
        window.ttq.track("GeneratedBankSlip", {
          event_id: payload?.eventId,
          content_id: payload?.offerInformations?.uuid,
          content_type: payload?.offerInformations?.type,
          value: payload?.paymentData?.value,
          currency: "BRL",
          payment_type: "boleto",
          due_date: new Date().toISOString(),
          content_ids: payload?.items?.map((item) => item.item_id),
          contents: payload?.items?.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
        break;
      case "generate-pix":
        window.ttq.track("GeneratedPix", {
          event_id: payload?.eventId,
          content_id: payload?.offerInformations?.uuid,
          content_type: payload?.offerInformations?.type,
          value: payload?.paymentData?.value,
          currency: "BRL",
          payment_type: "pix",
          due_date: new Date().toISOString(),
          content_ids: payload?.items?.map((item) => item.item_id),
          contents: payload?.items?.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
        break;
      case "purchase":
        window.ttq.track("Purchase", {
          event_id: payload?.eventId,
          content_id: payload?.offerInformations?.uuid,
          content_type: payload?.offerInformations?.type,
          value: payload?.paymentData?.value,
          currency: "BRL",
          order_id: payload?.saleId,
          due_date: new Date().toISOString(),
          payment_type: payload?.paymentData?.method,
          content_ids: payload?.items?.map((item) => item.item_id),
          contents: payload?.items?.map((item) => ({
            id: item.item_id,
            quantity: item.quantity,
            item_price: item.price,
          })),
        });
        break;
    }
  }
}
