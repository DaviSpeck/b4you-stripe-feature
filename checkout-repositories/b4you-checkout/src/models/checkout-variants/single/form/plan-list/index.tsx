import { useEffect } from "react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iOffer } from "@/interfaces/offer";
import { SortPlanByPeriod } from "@/shared/plans/sort-plans-by-period";
import { PlanItemStandard } from "./plan-item/standard";
import { PlanItemWithUpsell } from "./plan-item/upsell-plan";

export function PlanList() {
  const { offerData } = useOfferData();
  const { planId, set } = useOfferPayment();

  const calcOfferPrice = (plan: iOffer["payment"]["plans"][0]) => {
    let price = plan.charge_first
      ? plan.price + plan.subscription_fee_price
      : plan.price;

    if (!plan.charge_first && plan.subscription_fee_price > 0) {
      price = plan.subscription_fee_price;
    }

    return price;
  };

  const handleSelect = (plan: iOffer["payment"]["plans"][0]) => {
    set({
      planId: plan.uuid,
      offerPrice: calcOfferPrice(plan),
      offerOriginalPrice: plan.price,
    });
  };

  useEffect(() => {
    if (!offerData || planId) return;

    const { defaultPlan } = SortPlanByPeriod({
      plans: offerData.payment.plans,
    });

    let price = defaultPlan.charge_first
      ? defaultPlan.price + defaultPlan.subscription_fee_price
      : defaultPlan.price;

    if (!defaultPlan.charge_first && defaultPlan.subscription_fee_price > 0) {
      price = defaultPlan.subscription_fee_price;
    }

    set({
      planId: defaultPlan.uuid,
      offerPrice: price,
      offerOriginalPrice: defaultPlan.price,
    });
  }, [offerData]);

  if (!offerData) return <></>;

  const { planArr, defaultPlan, upsellPlan } = SortPlanByPeriod({
    plans: offerData.payment.plans,
  });

  if (!defaultPlan) return <></>;

  return (
    <ul className="flex flex-col gap-2.5 pt-4">
      {upsellPlan && planId && (
        <PlanItemWithUpsell
          plan={defaultPlan}
          planId={planId}
          upsellPlan={upsellPlan}
          onClick={() =>
            handleSelect(upsellPlan.uuid === planId ? defaultPlan : upsellPlan)
          }
        />
      )}
      {!upsellPlan &&
        planId &&
        planArr.map((plan) => (
          <PlanItemStandard
            key={plan.uuid}
            plan={plan}
            defaultPlan={defaultPlan}
            planId={planId}
            onClick={() => handleSelect(plan)}
          />
        ))}
    </ul>
  );
}
