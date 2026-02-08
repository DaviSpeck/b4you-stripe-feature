export type CheckoutType = 'standard' | '3steps';
export type CheckoutMode =
  | 'embedded'
  | 'transparent'
  | 'sandbox'
  | 'development';
export type CheckoutStep = 'identification' | 'address' | 'payment';
export type CheckoutPaymentMethod = 'credit_card' | 'pix' | 'boleto';

export type CheckoutEventName =
  | 'checkout_page_view'
  | 'checkout_session_started'
  | 'checkout_identification_started'
  | 'checkout_identification_filled'
  | 'checkout_identification_error'
  | 'checkout_identification_completed'
  | 'checkout_address_started'
  | 'checkout_address_filled'
  | 'checkout_address_error'
  | 'checkout_shipping_method_selected'
  | 'checkout_address_completed'
  | 'checkout_step_viewed'
  | 'checkout_step_advanced'
  | 'checkout_step_back'
  | 'checkout_payment_method_selected'
  | 'checkout_payment_data_started'
  | 'checkout_payment_data_error'
  | 'checkout_submit_clicked'
  | 'checkout_coupon_applied'
  | 'checkout_coupon_error'
  | 'checkout_order_bump_viewed'
  | 'checkout_order_bump_accepted'
  | 'checkout_order_bump_declined'
  | 'checkout_conversion_success'
  | 'checkout_payment_success'
  | 'checkout_payment_error';

export interface CheckoutEvent {
  eventId: string;
  eventName: CheckoutEventName;
  eventDescription: string;
  sessionId: string;
  offerId: string;
  checkoutType: CheckoutType;
  checkoutMode: CheckoutMode;
  step?: CheckoutStep;
  email?: string | null;
  phone?: string | null;
  paymentMethod?: CheckoutPaymentMethod | null;
  eventTimestamp: number;
  receivedAt?: string;
}

export interface OfferContext {
  offerId: string;
  productId: string;
  productName: string;
  producerId: string;
  producerName: string;
}

export interface CheckoutJourneyData {
  events: CheckoutEvent[];
  offerContexts: OfferContext[];
}
