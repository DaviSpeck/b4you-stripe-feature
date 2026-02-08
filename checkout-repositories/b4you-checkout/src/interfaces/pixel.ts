// eslint-disable-next-line @typescript-eslint/no-unused-vars
const eventPixelList = [
  "initiate-checkout",
  "add-payment-info",
  "add-address-info",
  "payment-upon-generate-payment-data",
  "event-paid",
] as const;

export type PixelEventType = (typeof eventPixelList)[number];

type CommonKeysPixelType = {
  api_token: boolean;
  pixel_id: string;
  domain: string;
  label: string;
};

type FacebookSeattingsType = {
  token: string;
  paid_pix: boolean;
  paid_billet: boolean;
  generated_pix: boolean;
  generated_billet: boolean;
  sessionPixelsEventId: string | null;
} & CommonKeysPixelType;

type GoogleAdsType = {
  initiate_checkout: boolean;
  label: string;
  purchase: boolean;
  trigger_boleto: boolean;
  trigger_pix: boolean;
} & CommonKeysPixelType;

type GoogleAnalyticsType = CommonKeysPixelType;

type PinterestType = CommonKeysPixelType;

type TiktokType = {
  trigger_purchase_boleto: boolean;
} & CommonKeysPixelType;

export interface iFacebookPixels {
  uuid: string;
  settings: FacebookSeattingsType;
}

export interface iGoogleAds {
  uuid: string;
  settings: GoogleAdsType;
}

export interface iGoogleAnalytics {
  uuid: string;
  settings: GoogleAnalyticsType;
}

export interface iTiktok {
  uuid: string;
  settings: TiktokType;
}

export interface iPinterest {
  uuid: string;
  settings: PinterestType;
}

export interface iTaboola {}

export interface iOutbrain {}

export interface iKwai {}

export type PixelsType = {
  sessionPixelsEventId: string;
  facebook: iFacebookPixels[];
  "google-ads": iGoogleAds[];
  "google-analytics": iGoogleAnalytics[];
  taboola: iTaboola[];
  outbrain: iOutbrain[];
  tiktok: iTiktok[];
  kwai: iKwai[];
  pinterest: iPinterest[];
};
