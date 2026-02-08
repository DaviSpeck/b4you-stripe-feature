import { v4 as uuid } from "uuid";
import { iOffer } from "@/interfaces/offer";

interface iParams {
  offerData: iOffer;
  price: number;
  fixedInstallmentAmount?: null | number;
}

export interface iInstallmentOptions {
  id: string;
  label: string;
  instalmentNumber: number;
  value: string;
}

type ResponseType = iInstallmentOptions[] | null;

export function InstallmentOptionList(params: iParams): ResponseType {
  const { offerData, price, fixedInstallmentAmount } = params;

  if (!offerData) return null;

  const { payment } = offerData;

  const monthlyRate = payment.installments_fee / 100;

  const installments = Array.from(
    { length: fixedInstallmentAmount ?? payment.installments },
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
      instalmentNumber: option.parcel,
      value: String(option.value),
    };
  });
}
