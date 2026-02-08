type PayloadType = {
  value?: number;
  currency?: string;
};

type EventTikTokType =
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "AddAddressInfo"
  | "GeneratedBankSlip"
  | "GeneratedPix";

declare interface Window {
  ttq: {
    track(event: EventTikTokType, payload?: payloadType): void;
  };
}
