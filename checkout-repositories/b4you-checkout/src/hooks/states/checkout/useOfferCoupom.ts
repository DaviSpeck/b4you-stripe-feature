import { create } from "zustand";
import { iCoupon } from "@/interfaces/coupon";

interface iUseOfferCoupon {
  couponData: null | iCoupon;
  discountType: "percent" | "cashback" | null;
  discountValue: number | null;
  isShippingFree: boolean;
  offerPriceWithDiscount: number | null;
  removeCoupon(): void;
  set(params: Partial<Omit<iUseOfferCoupon, "set">>): void;
}

export const useOfferCoupon = create<iUseOfferCoupon>()((set) => ({
  couponData: null,
  discountType: null,
  discountValue: null,
  offerPriceWithDiscount: null,
  isShippingFree: false,
  removeCoupon() {
    set({
      discountType: null,
      discountValue: null,
      couponData: null,
      isShippingFree: false,
      offerPriceWithDiscount: null,
    });
  },
  set(params) {
    set((states) => ({ ...states, ...params }));
  },
}));
