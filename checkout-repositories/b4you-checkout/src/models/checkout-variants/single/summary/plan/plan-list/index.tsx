import { useEffect, useState } from "react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { OrderBumpItem } from "./order-bump-item";
import { PlanItem } from "./plan-item";

export function PlanList() {
  const { offerData } = useOfferData();
  const { planId } = useOfferPayment();

  if (!offerData || !offerData.offer) return <></>;

  const title = Boolean(offerData.offer.alternative_name)
    ? offerData.offer.alternative_name
    : offerData.offer.name;

  if (!planId) return <></>;

  const planData = offerData.payment.plans.find((plan) => plan.uuid === planId);

  if (!planData) return <></>;

  let price = planData.charge_first
    ? planData.price + planData.subscription_fee_price
    : planData.price;

  if (!planData.charge_first && planData.subscription_fee_price > 0) {
    price = planData.subscription_fee_price;
  }

  return (
    <ul>
      <PlanItem
        title={`${title} - ${planData.frequency}`}
        description={planData.label}
        price={price}
        quantity={0}
      />
      <PlanList.OrderBumps />
    </ul>
  );
}

PlanList.OrderBumps = function () {
  const [orders, setOrders] = useState<Record<string, number>>({});

  const { orderBumps } = useOfferPayment();

  useEffect(() => {
    if (!orderBumps) return;

    const orderBump: Record<string, number> = {};

    orderBumps.forEach(
      (obUuid) => (orderBump[obUuid] = (orderBump[obUuid] || 0) + 1),
    );

    setOrders(orderBump);
  }, [orderBumps]);

  if (orderBumps.length === 0) return <></>;

  return (
    <>
      {orderBumps &&
        Object.entries(orders).map(([uuid, amount]) => (
          <OrderBumpItem key={uuid} orderBumpUuid={uuid} amount={amount} />
        ))}
    </>
  );
};
