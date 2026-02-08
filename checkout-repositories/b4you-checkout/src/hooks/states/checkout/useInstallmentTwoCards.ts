import { v4 as uuid } from "uuid";
import { create } from "zustand";
import { iOffer } from "@/interfaces/offer";

export interface iInstallmentOption {
  id: string;
  label: string;
  price: number;
  value: number;
}

interface iRecalcInstallments {
  offer: iOffer;
  price: number;
  fixed: number;
}

const recalcInstallments = (
  params: iRecalcInstallments,
): iInstallmentOption[] => {
  const { offer, price, fixed } = params;

  if (!offer) return [];

  const { payment } = offer;

  const monthlyRate = payment.installments_fee / 100;

  const installments = Array.from(
    { length: fixed ?? payment.installments },
    (_, index) => {
      const power = Math.pow(1 + monthlyRate, index + 1);

      const coefficient = (monthlyRate * power) / (power - 1);
      const installmentValue = price * coefficient;

      if (!payment.student_pays_interest) {
        return {
          parcel: index + 1,
          value: parseFloat((price / (index + 1)).toFixed(2)),
        };
      }

      return {
        parcel: index + 1,
        value: parseFloat(
          index + 1 === 1 ? price.toFixed(2) : installmentValue.toFixed(2),
        ),
      };
    },
  );

  return installments.map((option) => {
    const formatValue = String(
      parseFloat(String(option.value)).toFixed(2),
    ).replace(".", ",");

    let label = `${option.parcel}x de R$ ${formatValue}${option.parcel !== 1 ? "*" : ""}`;

    if (!payment.student_pays_interest) {
      label = `${option.parcel}x de R$ ${formatValue}${option.parcel !== 1 ? " sem juros" : ""}`;
    }

    return {
      id: uuid(),
      label,
      price: option.value,
      value: option.parcel,
    };
  });
};

type useInstallmentType = {
  cardOneInstallments: iInstallmentOption[];
  cardOnePrice: number;
  cardTwoInstallments: iInstallmentOption[];
  cardTwoPrice: number;
  defaultInstallment: number;
  cardOneInstallmentSelected: number | null;
  cardTwoInstallmentSelected: number | null;
  lastFourDigitsCardOne: null | string;
  lastFourDigitsCardTwo: null | string;
  recalcInstallments: (params: iRecalcInstallments) => iInstallmentOption[];
};

export const useInstallmentTwoCards = create<useInstallmentType>(() => ({
  cardOneInstallments: [],
  cardOnePrice: 0,
  cardTwoInstallments: [],
  cardTwoPrice: 0,
  defaultInstallment: 12,
  cardOneInstallmentSelected: null,
  cardTwoInstallmentSelected: null,
  recalcInstallments,
  lastFourDigitsCardOne: null,
  lastFourDigitsCardTwo: null,
}));
