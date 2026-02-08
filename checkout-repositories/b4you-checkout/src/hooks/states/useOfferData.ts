import { create } from "zustand";
import { iOffer, PaymentTypes } from "@/interfaces/offer";

interface iUseCheckoutOfferData {
  offerData: iOffer | null;
  getOfferPrice(
    paymentType: PaymentTypes,
    planId?: string | null,
  ): {
    price: number;
    discount: number;
  };
  set(data: iOffer): void;
}
export const useOfferData = create<iUseCheckoutOfferData>()((set, get) => ({
  offerData: null,
  getOfferPrice(paymentType, planId?: string | null) {
    const { offerData } = get();
    if (!offerData) return { price: 0, discount: 0 };
    return getOfferPriceInfo({ offerData, paymentType, planId });
  },
  set: (data) =>
    set(({ offerData }) => ({ offerData: { ...offerData, ...data } })),
}));

type getOfferPriceInfoParamsType = {
  offerData: iOffer;
  paymentType?: PaymentTypes;
  planId?: string | null;
};

function getOfferPriceInfo(params: getOfferPriceInfoParamsType): {
  price: number;
  discount: number;
} {
  const { offerData, paymentType, planId = null } = params;

  const priceTypes: Record<PaymentTypes, number> = {
    TWO_CARDS: offerData.prices.card,
    CARD: offerData.prices.card,
    PIX: offerData.prices.pix,
    BANK_SLIP: offerData.prices.billet,
  };

  const discountPercent: Record<PaymentTypes, number> = {
    TWO_CARDS: offerData.discounts.card,
    CARD: offerData.discounts.card,
    PIX: offerData.discounts.pix,
    BANK_SLIP: offerData.discounts.billet,
  };

  let price: number = 0;
  let discount: number = 0;

  const isCreditCard = offerData.payment.methods.includes("credit_card");
  const isPix = offerData.payment.methods.includes("pix");
  const isBankSlip = offerData.payment.methods.includes("billet");

  if (paymentType === "CARD" && isCreditCard) {
    price = priceTypes["CARD"];
    discount = discountPercent["CARD"];
  }

  if (paymentType === "PIX" && isPix) {
    price = priceTypes["PIX"];
    discount = discountPercent["PIX"];
  }

  if (paymentType === "BANK_SLIP" && isBankSlip) {
    price = priceTypes["BANK_SLIP"];
    discount = discountPercent["BANK_SLIP"];
  }

  const { plans, type } = offerData.payment;

  if (type === "subscription") {
    const plan =
      plans.find((plan) => plan.uuid === planId) ??
      plans.sort((a, b) => b.price - a.price)[0];

    price = plan.charge_first
      ? plan.price
      : plan.subscription_fee_price + plan.price;
  }

  if (paymentType && type === "single") {
    price = priceTypes[paymentType];
  }

  return { price, discount };
}
