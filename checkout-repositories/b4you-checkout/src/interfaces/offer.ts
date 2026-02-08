import { iCoupon } from "./coupon";
import { iCustomizations } from "./customization";
import { PixelsType } from "./pixel";
import { iProduct } from "./product";

export const PaymentOptions = [
  "CARD",
  "TWO_CARDS",
  "BANK_SLIP",
  "PIX",
] as const;

export type PaymentTypes = (typeof PaymentOptions)[number];

export type Frequency =
  | "mensal"
  | "bimestral"
  | "trimestral"
  | "semestral"
  | "anual";

export type FrequencyInput = Frequency | Capitalize<Frequency>;
export const normalizeFrequency = (
  f: string
): Frequency => f.toLowerCase() as Frequency;


type planType = {
  uuid: string;
  price: number;
  label: string;
  description: string;
  frequency_label: string;
  frequency: Frequency;
  subscription_fee: boolean;
  subscription_fee_price: number;
  charge_first: boolean;
  offer_uuid: string;
};

type CheckoutType = {
  hex_color: string;
  sidebar_picture: string | null;
  header_picture: string | null;
  header_picture_mobile: string | null;
  favicon: string | null;
  second_header_mobile: string | null;
  header_picture_secondary: string | null;
  url_video_checkout: string | null;
};

type PaymentType = {
  type: "single" | "subscription";
  methods: Array<"pix" | "credit_card" | "billet">;
  installments: number;
  installments_fee: number;
  plans: planType[];
  student_pays_interest: boolean;
};

type PricesType = {
  billet: number;
  card: number;
  pix: number;
};

type RegionCode = "no" | "ne" | "co" | "so" | "su";
export type ShippingByRegion = Partial<Record<RegionCode, number>>;
export type ShippingMode = 0 | 1;

type discountsType = PricesType;

type counterType = {
  active: boolean;
  label: string;
  label_end: string;
  seconds: number;
  color: string | null;
};

export type OrderBumpsType = {
  uuid: string;
  cover: string | null;
  label: string;
  discounts: discountsType;
  description: null | string;
  alternative_image: null | string;
  price: number;
  price_before: number;
  prices: PricesType;
  product: iProduct;
  show_quantity: boolean;
  payment_type: string;
  title: string;
  paymentSelected?: PaymentTypes;
  product_name: string | null;
};

type imageOfferType = {
  header_picture: string | null;
  header_picture_secondary: string | null;
  header_picture_mobile: string | null;
  second_header_mobile: string | null;
  sidebar_picture: string | null;
  url_video_checkout: string | null;
};

export interface iOfferShopify {
  grams: number;
  image: string;
  price: string;
  quantity: number;
  sku: string;
  title: string;
  variant_id: number;
}

export interface iPopUp {
  active: true;
  coupon: iCoupon;
  closePage: true;
  mouseMove: true;
  popup_delay: string;
  popup_title: string;
  hex_color_bg: string;
  hex_color_text: string;
  hex_color_button: string;
  popup_button_text: string;
  popup_discount_text: string;
  popup_secondary_text: string | null;
  hex_color_button_text: string;
}

export interface iUpsellNative {
  id: number;
  uuid: string;
  product_id: string;
  upsell_product_id: string;
  upsell_offer_id: string;
  is_plan: boolean;
  offers: iUpsellOffer[];
  plans: planType[];
  is_multi_offer: boolean;
  created_at: Date;
  updated_at: Date;

  step_color_background: string;
  step_color: string;
  is_step_visible: boolean;

  header: string;
  header_background_color: string;
  header_text_color: string;
  is_header_visible: boolean;

  alert_not_close_primary_color: string;
  alert_not_close_primary_text_color: string;
  is_message_not_close: boolean;

  title_image: string;
  title: string;
  title_size: number;
  title_color: string;

  subtitle_one: string;
  subtitle_one_size: number;
  subtitle_one_weight: number;
  subtitle_one_color: string;

  subtitle_two: string;
  subtitle_two_size: number;
  subtitle_two_weight: number;
  subtitle_two_color: string;

  is_one_click: boolean;
  btn_text_accept: string;
  btn_text_accept_size: number;
  btn_text_color_accept: string;
  btn_color_accept: string;

  btn_text_refuse: string;
  btn_text_color_refuse: string;
  btn_text_refuse_size: number;

  background: string;
  background_image_desktop: string | null;
  media_url: string | null;
  media_embed: string | null;
  is_embed_video: boolean;
  is_footer_visible: boolean;

  is_already_purchased: boolean;
  already_purchased_status: number | null;
  already_purchased_sale_item_uuid: string | null;
}

export interface iOffer {
  uuid: string;
  counter: counterType;
  enable_two_cards_payment: boolean;
  price: number;
  order_bumps: OrderBumpsType[];
  quantity: number;
  offer: { name: string; alternative_name: string };
  original_price: number;
  require_address: boolean;
  has_frenet: boolean;
  is_multi_offer: boolean;
  shipping_type: ShippingMode;
  shipping_price: number;
  shipping_by_region: ShippingByRegion;
  prices: PricesType;
  discounts: discountsType;
  pixels: PixelsType;
  checkout: CheckoutType;
  payment: PaymentType;
  description: string | null;
  product: iProduct;
  popup: iPopUp | null;
  customizations: iCustomizations;
  site_key: string;
  image_offer: imageOfferType;
  offerShopify?: iOfferShopify[];
  sixid: string | null;
  hasCouponFirstBuy: boolean;
  hasActiveCoupon: boolean;
  offer_upsell_native: iUpsellNative | null;
  show_cnpj: boolean;
}

export interface iUpsellOffer {
  uuid: string;
  description: string | null;

  offer: {
    name: string;
    alternative_name: string;
  };

  product: {
    cover: string | null;
  };

  customizations: {
    alternative_image: string | null;
    show_custom_description: string;
  };

  payment: {
    methods: Array<"pix" | "credit_card" | "billet">;
    installments: number;
  };

  totalPrice: number;
  mainPaymentMethod: "pix" | "credit_card" | "billet";
  student_pays_interest: boolean;
}