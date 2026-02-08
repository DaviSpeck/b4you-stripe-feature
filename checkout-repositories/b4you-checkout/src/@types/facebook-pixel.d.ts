type EventFacebookType =
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "AddAddressInfo"
  | "GeneratedBankSlip"
  | "GeneratedPix";

declare interface Window {
  fbq(
    type: "track" | "trackCustom",
    event: EventFacebookType,
    payload?: unknown,
  ): void;
}
