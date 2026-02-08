import { Frequency, iOffer, normalizeFrequency } from "@/interfaces/offer";
import { cn } from "@/shared/libs/cn";
import { CalcPlanPricePerMonth } from "@/shared/plans/calc-plan-price-per-month";
import { CalcPlanPriceSavings } from "@/shared/plans/calc-plan-price-savings";

interface iProps {
  plan: iOffer["payment"]["plans"][0];
  upsellPlan: iOffer["payment"]["plans"][0];
  planId: string;
  onClick: VoidFunction;
}

export const PlanItemWithUpsell = (props: iProps) => {
  const { plan, upsellPlan, planId, onClick = () => null } = props;

  const planPrice = CalcPlanPricePerMonth({
    price: plan.price,
    frequency: plan.frequency,
  });

  const upsellPlanMonthlyPrice = CalcPlanPricePerMonth({
    price: upsellPlan.price,
    frequency: upsellPlan.frequency,
  });

  const savingMoney = CalcPlanPriceSavings({
    currentPlanFrequency: upsellPlan.frequency,
    currentMonthlyPlanPrice: upsellPlanMonthlyPrice,
    monthlyPlanPrice: planPrice,
  });

  const frequencyDictionary: Record<Frequency, string> = {
    mensal: "mensalmente",
    bimestral: "bimestralmente",
    trimestral: "trimestralmente",
    semestral: "semestralmente",
    anual: "anualmente",
  };

  return (
    <li
      className={cn("rounded-[6px] border-[1px] border-[#1a1a1a1a]")}
      onClick={onClick}
    >
      <div className="p-3 pb-2.5">
        <div className="flex justify-between">
          <h2 className="text-[0.85rem] font-medium">
            {planId === upsellPlan.uuid ? upsellPlan.label : plan.label}
          </h2>
          <span
            className={cn(
              "block text-[0.85rem] font-medium",
              !plan.charge_first &&
              plan.subscription_fee_price > 0 &&
              "line-through",
            )}
          >
            {(planId === upsellPlan.uuid
              ? upsellPlan
              : plan
            ).price.toLocaleString("pt-br", {
              currency: "BRL",
              style: "currency",
            })}
          </span>
        </div>
        <p className="text-[0.75rem] font-normal">
          Cobrado{" "}
          {frequencyDictionary[normalizeFrequency(planId === upsellPlan.uuid ? upsellPlan.frequency : plan.frequency)]}
        </p>
        {(planId === upsellPlan.uuid ? upsellPlan : plan).subscription_fee && (
          <p className="text-[0.65rem] font-semibold">
            <span className="pr-1 font-medium">Taxa de Adesão:</span>
            {plan.subscription_fee_price.toLocaleString("pt-br", {
              currency: "BRL",
              style: "currency",
            })}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-1 border-[#1a1a1a1a] bg-[#1a1a1a0d] px-[9px] py-[12px]">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center gap-1">
            <div className="flex w-full flex-wrap items-center gap-1">
              <input
                className="h-[14px] w-[14px] flex-shrink-0"
                type="checkbox"
                checked={planId === upsellPlan.uuid}
                onClick={onClick}
              />

              <span className="h-fit flex-shrink-0 rounded-[4px] bg-[#cbf4c9] px-[6px] py-[2px] text-[0.62rem] font-medium text-[#0e6245]">
                Economize{" "}
                {savingMoney.toLocaleString("pt-br", {
                  currency: "BRL",
                  style: "currency",
                })}
              </span>

              <div className="flex w-full min-w-[190px] flex-1 flex-wrap items-center justify-between gap-2">
                <span className="flex-shrink-0 text-[0.625rem] font-medium">
                  com cobrança {upsellPlan.frequency}
                </span>
                <span className="flex-shrink-0 text-[0.7rem] font-medium">
                  {upsellPlanMonthlyPrice.toLocaleString("pt-br", {
                    currency: "BRL",
                    style: "currency",
                  })}
                  /mês
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
