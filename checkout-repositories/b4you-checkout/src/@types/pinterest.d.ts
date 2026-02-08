type EventPinterestType =
  | "initiatecheckout"
  | "addpaymentInfo"
  | "addAddressInfo"
  | "generateBankSlip"
  | "generatePix"
  | "purchase"
  | "subscribe"
  | "custom"
  | "load"
  | "page";

declare interface Window {
  pintrk(type: "track", event: EventPinterestType, payload?: unknown): void;
}
