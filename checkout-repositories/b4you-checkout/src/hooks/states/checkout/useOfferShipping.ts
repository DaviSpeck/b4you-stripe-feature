import { create } from "zustand";
import { FrenetOptionType } from "@/pages/api/frenet";
import { useOfferData } from "../useOfferData";
import { useOfferCoupon } from "./useOfferCoupom";
import { useOfferPayment } from "./useOfferPayment";

export type ShippingOrigin =
  | "FREE_RULE"          // shipping_type = 0
  | "FIXED"              // frete fixo
  | "REGION"             // por região
  | "COUPON"             // cupom zerou
  | "FRENET_CALCULATED"  // frenet retornou opção
  | "FRENET_FALLBACK";   // frenet não retornou → fallback

interface iUseOfferShipping {
  shippingPrice: number | null;
  shippingCompany: null | string;
  shippingFree: boolean;
  shippingOrigin?: ShippingOrigin;
  frenetShippingOptions: FrenetOptionType[];
  currentZipcode: null | string;
  isShippingRequired(): boolean;
  set(params: Partial<Omit<iUseOfferShipping, "set">>): void;
}

export const useOfferShipping = create<iUseOfferShipping>()((set) => ({
  shippingPrice: null,
  shippingCompany: null,
  shippingFree: false,
  shippingOrigin: undefined,
  frenetShippingOptions: [],
  currentZipcode: null,
  isShippingRequired,
  set(params) {
    set((states) => ({ ...states, ...params }));
  },
}));

function isShippingRequired() {
  const { offerData } = useOfferData.getState();
  const { orderBumps } = useOfferPayment.getState();
  const { isShippingFree } = useOfferCoupon.getState();

  const isPhysicalProduct = offerData?.order_bumps.find(
    (ob) => orderBumps.includes(ob.uuid) && ob.product.type === "physical",
  );

  let isShippingRequired: boolean = true;

  const hasFrenet = offerData?.has_frenet;

  if (isPhysicalProduct) {
    return Boolean(isPhysicalProduct);
  }

  if (isPhysicalProduct && hasFrenet) {
    isShippingRequired = true;
  }

  if (isShippingFree || offerData?.shipping_type === 0) {
    isShippingRequired = false;
  }

  if (hasFrenet && offerData.product.type === "physical") {
    isShippingRequired = true;
  }

  return isShippingRequired;
}
