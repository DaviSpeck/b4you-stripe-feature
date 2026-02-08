import { Frequency, iOffer, normalizeFrequency } from "@/interfaces/offer";

interface iParams {
  price: number;
  frequency: iOffer["payment"]["plans"][0]["frequency"];
}

export const CalcPlanPricePerMonth = (params: iParams) => {
  const { price, frequency } = params;

  const calcs: Record<Frequency, number> = {
    mensal: price,
    bimestral: price / 2,
    trimestral: price / 3,
    semestral: price / 6,
    anual: price / 12,
  };

  return calcs[normalizeFrequency(frequency)];
};