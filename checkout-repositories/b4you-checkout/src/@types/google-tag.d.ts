type EventGoogleType =
  | "begin_checkout"
  | "add_payment_info"
  | "add_shipping_info"
  | "purchase"
  | "conversion"
  | "generated_bank_slip"
  | "generated_pix";

declare interface Window {
  dataLayer: unknown[];
  gtag: (type: "event", eventType: EventGoogleType, payload?: unknown) => void;
}
