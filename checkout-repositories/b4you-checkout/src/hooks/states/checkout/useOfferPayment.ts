import { create } from "zustand";
import { iOffer, PaymentTypes } from "@/interfaces/offer";

export interface installmentOption {
  id: string;
  label: string;
  instalmentNumber: number;
  value: string;
}

interface iUseOfferPayment {
  installmentOptions: installmentOption[] | null;
  installmentOptionsCardTwo: installmentOption[] | null;
  installmentSelectedValue: number | null;
  installmentSelectedValueCardTwo: number | null;
  membershipFee: number | null;
  paymentSelected: PaymentTypes | null;
  offerPrice: number | null;
  offerOriginalPrice: number | null;
  orderBumps: string[];
  planId: string | null;
  planType: string | null;
  turnstileToken: string | null;
  turnstileTokenExpiresAt: number | null;
  isPaying: boolean;
  isPixGenerate: boolean;
  isBankSlipGenerate: boolean;
  isPaid: boolean;
  isCouponFirstBuy: boolean;
  needsCaptcha: boolean;
  set(
    params:
      | Partial<Omit<iUseOfferPayment, "set">>
      | ((state: iUseOfferPayment) => Partial<iUseOfferPayment>),
  ): void;
  getInstallmentSelected(): installmentOption;
  updateInstallmentOptions(
    params: Pick<iUseOfferPayment, "installmentOptions"> & {
      initialValue: number;
    },
  ): void;
  configurePurchaseDetails(offerData: iOffer): number;
  startCaptcha(): void;
  resolveCaptcha(token: string): void;
  expireCaptcha(params?: { keepOpen?: boolean }): void;
  clearCaptcha(): void;
  isTurnstileTokenValid(): boolean;
  getValidTurnstileToken(): string | null;
  consumeTurnstileToken(): string | null;
}

const TURNSTILE_TOKEN_TTL_MS = 4 * 60 * 1000;

export const useOfferPayment = create<iUseOfferPayment>()((set, get) => ({
  installmentOptions: null,
  installmentOptionsCardTwo: null,
  installmentSelectedValue: null,
  installmentSelectedValueCardTwo: null,
  membershipFee: null,
  paymentSelected: null,
  offerOriginalPrice: null,
  offerPrice: null,
  planId: null,
  planType: null,
  orderBumps: [],
  turnstileToken: null,
  turnstileTokenExpiresAt: null,
  isPaying: false,
  isPixGenerate: false,
  isBankSlipGenerate: false,
  isPaid: false,
  isCouponFirstBuy: false,
  needsCaptcha: false,
  set(params) {
    set((states) =>
      typeof params === "function" ? params(states) : { ...states, ...params },
    );
  },
  getInstallmentSelected() {
    const { installmentOptions, installmentSelectedValue } = get();

    if (!installmentSelectedValue) {
      const installmentSelected =
        installmentOptions![installmentOptions!.length - 1];
      set({ installmentSelectedValue: Number(installmentSelected.value) });
      return installmentSelected;
    }

    return installmentOptions!.find(
      (option) => option.value === String(installmentSelectedValue),
    )!;
  },
  updateInstallmentOptions(params) {
    const { installmentOptions, initialValue } = params;

    const findInstallment = installmentOptions?.find(
      (installment) => installment.instalmentNumber === initialValue,
    );

    set({
      installmentOptions,
      installmentSelectedValue: Number(
        findInstallment?.value ??
        installmentOptions![installmentOptions!.length - 1].value,
      ),
    });
  },
  configurePurchaseDetails(offerData) {
    const { paymentType, price } = getPaymentTypeAndOfferPrice(offerData);
    set({ offerPrice: price, paymentSelected: paymentType });
    return price;
  },
  startCaptcha() {
    set({
      needsCaptcha: true,
      turnstileToken: null,
      turnstileTokenExpiresAt: null,
    });
  },

  resolveCaptcha(token) {
    set({
      turnstileToken: token,
      needsCaptcha: false,
      turnstileTokenExpiresAt: Date.now() + TURNSTILE_TOKEN_TTL_MS,
    });
  },

  expireCaptcha(params) {
    const keepOpen = params?.keepOpen ?? false;
    set({
      needsCaptcha: keepOpen,
      turnstileToken: null,
      turnstileTokenExpiresAt: null,
    });
  },

  clearCaptcha() {
    set({
      turnstileToken: null,
      needsCaptcha: false,
      turnstileTokenExpiresAt: null,
    });
  },

  isTurnstileTokenValid() {
    const { turnstileToken, turnstileTokenExpiresAt } = get();
    if (!turnstileToken || !turnstileTokenExpiresAt) return false;
    if (Date.now() >= turnstileTokenExpiresAt) {
      set({
        turnstileToken: null,
        turnstileTokenExpiresAt: null,
      });
      return false;
    }
    return true;
  },

  getValidTurnstileToken() {
    const { turnstileToken } = get();
    return get().isTurnstileTokenValid() ? turnstileToken : null;
  },

  consumeTurnstileToken() {
    const { turnstileToken } = get();
    if (!get().isTurnstileTokenValid() || !turnstileToken) {
      return null;
    }
    set({
      turnstileToken: null,
      turnstileTokenExpiresAt: null,
    });
    return turnstileToken;
  },
}));

function getPaymentTypeAndOfferPrice(offerData: iOffer) {
  let price: number = offerData.original_price;
  let paymentType: PaymentTypes = "CARD";

  if (offerData.payment.methods.includes("credit_card")) {
    price = offerData.prices.card;
  } else if (offerData.payment.methods.includes("pix")) {
    price = offerData.prices.pix;
    paymentType = "PIX";
  } else if (offerData.payment.methods.includes("billet")) {
    price = offerData.prices.billet;
    paymentType = "BANK_SLIP";
  }
  return { price, paymentType };
}
