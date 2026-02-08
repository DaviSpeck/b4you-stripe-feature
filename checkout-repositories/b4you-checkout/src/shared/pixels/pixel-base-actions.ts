import { PaymentTypes } from "@/interfaces/offer";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const eventPixelList = [
  "initiate-checkout",
  "add-payment-info",
  "add-address-info",
  "generate-bank-slip",
  "generate-pix",
  "purchase",
] as const;

export type PixelEventType = (typeof eventPixelList)[number];

export type ContractDataType = {
  eventId: string;
  label?: string;
  pixelId?: string;
  saleId?: string;
  shippingPrice?: number;
  paymentData?: {
    currency?: string;
    value?: number;
    method?: PaymentTypes;
    couponName?: string;
  };
  offerInformations?: {
    uuid: string;
    name?: string;
    originalPrice?: string;
    numItens?: number;
    type?: "product" | "plan";
  };
  addressData?: {
    city?: string;
    country?: string;
    email?: string;
    first_name?: string;
    phone?: string;
    region?: string;
    street?: string;
    zip?: string;
  };
  items?: {
    item_name?: string;
    item_id?: string;
    index?: number;
    quantity?: number;
    price?: number;
  }[];
};

export type EmitEventParamsType = {
  event: PixelEventType;
  payload?: ContractDataType;
};

export abstract class PixelBaseActions {
  protected abstract process(event: unknown, payload: unknown): void;

  public emitEvent(params: EmitEventParamsType) {
    const { event, payload } = params;
    const payloadTransformed = payload;
    this.process(event, payloadTransformed);
  }
}
