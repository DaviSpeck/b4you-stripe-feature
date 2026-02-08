import { create } from "zustand";
import { PaymentTypes } from "@/interfaces/offer";
import { iUpsellCardType } from "@/interfaces/upsell";

interface iUpsellStorage {
  paymentSelect: PaymentTypes;
  cardData: iUpsellCardType | null;
  pixData: null;
  installmentsValue: null | string;
}

export const upsellStorage = create<iUpsellStorage>(() => ({
  paymentSelect: "CARD",
  cardData: null,
  pixData: null,
  installmentsValue: null,
}));
