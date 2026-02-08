import { Frequency, iOffer, normalizeFrequency } from "@/interfaces/offer";

type ParamsType = { planId: string | null; offerData: iOffer };
type ReturnType = iOffer["payment"]["plans"][0] & { periodInNumber: number };

export function getPlanDataSelectedById(params: ParamsType): ReturnType | null {
  const { planId, offerData } = params;

  const planDict: Record<Frequency, number> = {
    mensal: 1,
    bimestral: 2,
    trimestral: 3,
    semestral: 6,
    anual: 12,
  };

  const plans = offerData.payment.plans;

  if (!planId) {
    const findPlans = plans.sort((a, b) => b.price - a.price)[0];
    return Object.assign(findPlans ?? {}, {
      periodInNumber:
        planDict[normalizeFrequency(findPlans?.frequency ?? "anual")],
    });
  }

  const findPlan = plans.find((plan) => plan.uuid === planId);

  if (!findPlan) return null;

  return Object.assign(findPlan ?? {}, {
    periodInNumber: planDict[normalizeFrequency(findPlan?.frequency ?? "anual")],
  });
}
