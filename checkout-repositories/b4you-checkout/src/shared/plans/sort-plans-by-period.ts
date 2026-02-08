import { iOffer, normalizeFrequency, Frequency } from "@/interfaces/offer";
import { CalcPlanPricePerMonth } from "./calc-plan-price-per-month";
import { CalcPlanPriceSavings } from "./calc-plan-price-savings";

interface iParams {
  plans: iOffer["payment"]["plans"];
}

type ResponseType = {
  planArr: iOffer["payment"]["plans"];
  defaultPlan: iOffer["payment"]["plans"][0];
  upsellPlan: iOffer["payment"]["plans"][0] | null;
};

const periodOrder: Record<Frequency, number> = {
  mensal: 1,
  bimestral: 2,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

export const SortPlanByPeriod = (params: iParams): ResponseType => {
  const { plans } = params;

  const plansList = [...plans].sort((a, b) => {
    const aPeriod = periodOrder[normalizeFrequency(a.frequency)];
    const bPeriod = periodOrder[normalizeFrequency(b.frequency)];
    return aPeriod - bPeriod;
  });

  const data: ResponseType = {
    defaultPlan: plansList[0],
    planArr: plansList,
    upsellPlan: null,
  };

  if (plansList.length === 2) {
    const defaultValuePrice = CalcPlanPricePerMonth({
      price: data.defaultPlan.price,
      frequency: data.defaultPlan.frequency,
    });

    const possibleUpsellPrice = CalcPlanPricePerMonth({
      price: plansList[1].price,
      frequency: plansList[1].frequency,
    });

    const isSavingMoney = CalcPlanPriceSavings({
      monthlyPlanPrice: defaultValuePrice,
      currentPlanFrequency: plansList[1].frequency,
      currentMonthlyPlanPrice: possibleUpsellPrice,
    });

    if (isSavingMoney > 0) {
      data.upsellPlan = plansList[1];
    }
  }

  return data;
};