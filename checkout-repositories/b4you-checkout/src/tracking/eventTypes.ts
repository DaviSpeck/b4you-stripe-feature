export type CheckoutType = "standard" | "3steps";
export type CheckoutMode = "embedded" | "transparent" | "sandbox" | "development";
export type CheckoutStep = "identification" | "address" | "payment";
export type PaymentMethod = "credit_card" | "pix" | "boleto";
export type ExecutionEnvironment = "sandbox" | "development" | "production";

export type CheckoutEventName =
  | "checkout_page_view"
  | "checkout_session_started"
  | "checkout_identification_started"
  | "checkout_identification_filled"
  | "checkout_identification_error"
  | "checkout_identification_completed"
  | "checkout_address_started"
  | "checkout_address_filled"
  | "checkout_address_error"
  | "checkout_shipping_method_selected"
  | "checkout_address_completed"
  | "checkout_step_viewed"
  | "checkout_step_advanced"
  | "checkout_step_back"
  | "checkout_payment_method_selected"
  | "checkout_payment_data_started"
  | "checkout_payment_data_error"
  | "checkout_coupon_applied"
  | "checkout_coupon_error"
  | "checkout_order_bump_viewed"
  | "checkout_order_bump_accepted"
  | "checkout_order_bump_declined"
  | "checkout_submit_clicked"
  | "checkout_payment_success"
  | "checkout_conversion_success"
  | "checkout_payment_error";

export interface CheckoutEventPayload {
  eventId: string;
  eventName: CheckoutEventName;
  eventDescription: string;
  sessionId: string;
  offerId: string;
  checkoutType: CheckoutType;
  checkoutMode: CheckoutMode;
  executionEnvironment: ExecutionEnvironment;
  fullHostname: string;
  rootDomain: string;
  step?: CheckoutStep;
  email?: string;
  phone?: string;
  paymentMethod?: PaymentMethod;
  timestamp: number;
}

export const checkoutEventDescriptions: Record<CheckoutEventName, string> = {
  checkout_page_view: "Checkout page viewed",
  checkout_session_started: "Checkout session started",
  checkout_identification_started: "Checkout identification started",
  checkout_identification_filled: "Checkout identification filled",
  checkout_identification_error: "Checkout identification error",
  checkout_identification_completed: "Checkout identification completed",
  checkout_address_started: "Checkout address started",
  checkout_address_filled: "Checkout address filled",
  checkout_address_error: "Checkout address error",
  checkout_shipping_method_selected: "Checkout shipping method selected",
  checkout_address_completed: "Checkout address completed",
  checkout_step_viewed: "Checkout step viewed",
  checkout_step_advanced: "Checkout step advanced",
  checkout_step_back: "Checkout step back",
  checkout_payment_method_selected: "Checkout payment method selected",
  checkout_payment_data_started: "Checkout payment data started",
  checkout_payment_data_error: "Checkout payment data error",
  checkout_coupon_applied: "Checkout coupon applied",
  checkout_coupon_error: "Checkout coupon error",
  checkout_order_bump_viewed: "Checkout order bump viewed",
  checkout_order_bump_accepted: "Checkout order bump accepted",
  checkout_order_bump_declined: "Checkout order bump declined",
  checkout_submit_clicked: "Checkout submit clicked",
  checkout_payment_success: "Checkout payment success",
  checkout_conversion_success: "Checkout conversion success",
  checkout_payment_error: "Checkout payment error",
};

export function toPaymentMethod(
  paymentSelected?: string | null,
): PaymentMethod | undefined {
  switch (paymentSelected) {
    case "CARD":
    case "TWO_CARDS":
      return "credit_card";
    case "PIX":
      return "pix";
    case "BANK_SLIP":
      return "boleto";
    default:
      return undefined;
  }
}
