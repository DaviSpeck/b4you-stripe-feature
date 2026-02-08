import {
  ContractDataType,
  PixelBaseActions,
  PixelEventType,
} from "../pixel-base-actions";

export class PinterestPixel extends PixelBaseActions {
  constructor() {
    super();
  }

  process(event: PixelEventType, payload: ContractDataType): void {
    switch (event) {
      case "initiate-checkout":
        window.pintrk("track", "initiatecheckout", {
          order_id: payload.offerInformations?.uuid,
          property: payload.offerInformations?.name,
          event_id: payload.eventId,
        });
        break;
      case "add-address-info":
        window.pintrk("track", "addAddressInfo", {
          event_name: "add-shiping-info",
          order_id: payload.offerInformations?.uuid,
          property: payload.offerInformations?.name,
          event_id: payload.eventId,
        });
        break;
      case "add-payment-info":
        window.pintrk("track", "addpaymentInfo", {
          order_id: payload.offerInformations?.uuid,
          property: payload.offerInformations?.name,
          currency: "BRL",
          order_quantity: payload.items?.length,
          promo_code: payload.paymentData?.couponName,
          event_id: payload.eventId,
        });
        break;
      case "generate-bank-slip":
        window.pintrk("track", "generateBankSlip", {
          event_name: "generate-bank-slip",
          order_id: payload.offerInformations?.uuid,
          property: payload.offerInformations?.name,
          currency: "BRL",
          order_quantity: payload.items?.length,
          promo_code: payload.paymentData?.couponName,
          event_id: payload.eventId,
        });
        break;
      case "generate-pix":
        window.pintrk("track", "generatePix", {
          event_name: "generate-pix",
          order_id: payload.offerInformations?.uuid,
          property: payload.offerInformations?.name,
          currency: "BRL",
          order_quantity: payload.items?.length,
          promo_code: payload.paymentData?.couponName,
          event_id: payload.eventId,
        });
        break;
      case "purchase":
        window.pintrk("track", "purchase", {
          order_id: payload.offerInformations?.uuid,
          property: payload.offerInformations?.name,
          currency: "BRL",
          order_quantity: payload.items?.length,
          promo_code: payload.paymentData?.couponName,
          event_id: payload.eventId,
        });
        break;
    }
  }
}
