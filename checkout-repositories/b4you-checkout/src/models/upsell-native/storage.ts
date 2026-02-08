import { create } from "zustand";

interface iStorage {
  offerSelectUuid: string | null;
  upsellOfferUuid: string | null;

  planSelect: {
    uuid: string;
    offer_uuid: string;
  } | null;

  saleItemId: string | null;
  paymentMethods: string[];
  isOneClick: boolean;
  hydrated: boolean;

  pixData: {
    price: number;
    originalPrice: number;
    pixData: {
      qrcode: string;
      qrcode_url: string;
      sale_id?: string;
    };
    sale_id?: string;
  } | null;

  cardData: {
    price: number;
    originalPrice: number;
    lastFourDigits: number;
    default_installment: number;
    studentPaysInterest: boolean;
    mainPaymentMethod: "credit_card" | "pix";
    installments: { parcel: number; value: number }[];
    maxInstallment: { parcel: number; value: number };
  } | null;

  set(params: Partial<Omit<iStorage, "set" | "hydrateFromUrl">>): void;

  hydrateFromUrl(params: {
    offerId: string;
    saleItemId: string;
  }): void;
}

export const useUpsellNativeStorage = create<iStorage>((set) => ({
  paymentMethods: [],
  planSelect: null,
  offerSelectUuid: null,
  upsellOfferUuid: null,
  saleItemId: null,
  cardData: null,
  pixData: null,
  isOneClick: false,
  hydrated: false,

  set: (data) =>
    set((prev) => ({
      ...prev,
      ...data,
    })),

  hydrateFromUrl: ({ offerId, saleItemId }) =>
    set(() => ({
      upsellOfferUuid: offerId,
      offerSelectUuid: offerId,
      saleItemId,
      hydrated: true,
    })),
}));