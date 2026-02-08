import { Frequency, iOffer, normalizeFrequency } from "@/interfaces/offer";
import { cn } from "@/shared/libs/cn";
import { CalcPlanPricePerMonth } from "@/shared/plans/calc-plan-price-per-month";
import { CalcPlanPriceSavings } from "@/shared/plans/calc-plan-price-savings";

interface iProps {
  plan: iOffer["payment"]["plans"][0];
  defaultPlan: iOffer["payment"]["plans"][0];
  planId: string;
  planAmount: number;
  onClick: VoidFunction;
}

export const PlanItemStandard = (props: iProps) => {
  const {
    plan,
    defaultPlan,
    planId = "",
    planAmount,
    onClick = () => null,
  } = props;

  const monthlyPlanPrice = CalcPlanPricePerMonth({
    price: defaultPlan.price,
    frequency: defaultPlan.frequency,
  });

  const currentMonthlyPlanPrice = CalcPlanPricePerMonth({
    price: plan.price,
    frequency: plan.frequency,
  });

  const savingMoney = CalcPlanPriceSavings({
    currentPlanFrequency: plan.frequency,
    currentMonthlyPlanPrice,
    monthlyPlanPrice,
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
      className={cn(
        "cursor-pointer rounded-[6px] border-[1px] border-[#1a1a1a1a]",
      )}
      onClick={onClick}
    >
      <div className="p-3 pb-2.5">
        <div className="flex justify-between">
          <h2 className="text-[0.85rem] font-medium">{plan.label}</h2>
          <span
            className={cn(
              "block text-[0.85rem] font-medium",
              !plan.charge_first &&
              plan.subscription_fee_price > 0 &&
              "line-through",
            )}
          >
            {plan.price.toLocaleString("pt-br", {
              currency: "BRL",
              style: "currency",
            })}
          </span>
        </div>
        <p className="text-[0.75rem] font-normal">
          Cobrado {frequencyDictionary[normalizeFrequency(plan.frequency)]}
        </p>
        {plan.subscription_fee && (
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
            <input
              className="h-[14px] w-[14px]"
              type="checkbox"
              checked={planId === plan.uuid}
              onClick={onClick}
            />
            <div className="flex w-full flex-wrap items-center gap-1">
              {savingMoney > 0 && (
                <span className="h-fit rounded-[4px] bg-[#cbf4c9] px-[6px] py-[2px] text-[0.62rem] font-medium whitespace-nowrap text-[#0e6245]">
                  Economize{" "}
                  {savingMoney.toLocaleString("pt-br", {
                    currency: "BRL",
                    style: "currency",
                  })}
                </span>
              )}
              <div className="flex flex-1 items-center justify-between gap-2">
                {savingMoney > 0 && (
                  <span className="block w-full text-[0.625rem] font-medium whitespace-nowrap">
                    com cobrança {plan.frequency}
                  </span>
                )}
                {planAmount > 1 && (
                  <span className="block text-[0.7rem] font-medium whitespace-nowrap">
                    {currentMonthlyPlanPrice.toLocaleString("pt-br", {
                      currency: "BRL",
                      style: "currency",
                    })}
                    /mês
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
