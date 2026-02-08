import { Frequency, iOffer, normalizeFrequency } from "@/interfaces/offer";

interface iParams {
  currentMonthlyPlanPrice: number;
  currentPlanFrequency: iOffer["payment"]["plans"][0]["frequency"];
  monthlyPlanPrice: number;
}

export const CalcPlanPriceSavings = (params: iParams): number => {
  const {
    currentMonthlyPlanPrice = 0,
    monthlyPlanPrice = 0,
    currentPlanFrequency,
  } = params;

  const calc: Record<Frequency, number> = {
    mensal: monthlyPlanPrice - currentMonthlyPlanPrice,
    bimestral: monthlyPlanPrice * 2 - currentMonthlyPlanPrice * 2,
    trimestral: monthlyPlanPrice * 3 - currentMonthlyPlanPrice * 3,
    semestral: monthlyPlanPrice * 6 - currentMonthlyPlanPrice * 6,
    anual: monthlyPlanPrice * 12 - currentMonthlyPlanPrice * 12,
  };

  return calc[normalizeFrequency(currentPlanFrequency)];
};