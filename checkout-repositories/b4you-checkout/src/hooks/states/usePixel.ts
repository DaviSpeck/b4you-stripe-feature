import { create } from "zustand";
import { iCoupon } from "@/interfaces/coupon";
import { PaymentTypes } from "@/interfaces/offer";

interface iUsePixelStates {
  isPixGenerated: boolean;
  isBankSlipGenerated: boolean;
  isPaymentInformations: boolean;
  isAddressInformations: boolean;
  isPaid: boolean;
  paymentSelect: PaymentTypes;
  coupon: iCoupon | null;
  totalPrice: number;
  shippingPrice: number | null;
  saleId: null | string;
  set(params: Partial<Omit<iUsePixelStates, "set">>): void;
}

export const usePixelStates = create<iUsePixelStates>((set) => ({
  coupon: null,
  totalPrice: 0,
  shippingPrice: null,
  paymentSelect: "CARD",
  isAddressInformations: false,
  isBankSlipGenerated: false,
  isPaid: false,
  isPaymentInformations: false,
  isPixGenerated: false,
  saleId: null,
  set(params) {
    set((states) => ({ ...states, ...params }));
  },
}));
