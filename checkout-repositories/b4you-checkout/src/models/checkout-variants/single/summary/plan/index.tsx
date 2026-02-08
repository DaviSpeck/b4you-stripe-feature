import { useCallback, useEffect } from "react";
import { useOfferCoupon, useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { CalcCouponDiscount } from "@/shared/functions/coupon";
import { orderBumpsTotal } from "@/shared/functions/order-bumps";
import { InstallmentOptionList } from "@/shared/functions/payments";
import { getPlanDataSelectedById } from "@/shared/functions/payments/get-plan-data-selected-by-id";
import { PlanList } from "./plan-list";
import { TotalPlan } from "./total-plan";

export function SummaryPlan() {
  const { offerData } = useOfferData();

  const {
    couponData,
    discountValue,
    discountType,
    offerPriceWithDiscount,
    set: setOfferCoupon,
  } = useOfferCoupon();

  const {
    planId,
    offerPrice,
    paymentSelected,
    orderBumps,
    updateInstallmentOptions,
    set: setOfferPayment,
  } = useOfferPayment();

  const updateTotalPriceFunction = useCallback(() => {
    if (!offerData || !planId) return;

    const plan = offerData.payment.plans.find((p) => p.uuid === planId)!;

    let price = plan.charge_first
      ? plan.subscription_fee_price + plan.price
      : plan.price;

    if (!plan.charge_first && plan.subscription_fee_price > 0) {
      price = plan.subscription_fee_price;
    }

    const totalOrderBumps = orderBumpsTotal({
      orderBumpsSelected: orderBumps,
      offerData,
      discountPercent: discountValue ?? 0,
      paymentSelect: paymentSelected ?? "CARD",
    });

    price += totalOrderBumps.originalPrice;

    if (couponData) {
      const priceWithDiscount = CalcCouponDiscount({
        couponValue: discountValue!,
        discountType: discountType!,
        priceToApplyDiscount: price,
      });
      price = priceWithDiscount + (totalOrderBumps.priceWithDiscount ?? 0);
    }

    setOfferPayment({
      offerPrice: price,
      offerOriginalPrice: price,
    });
  }, [planId, orderBumps.length]);

  function updatePriceWithDiscountFunction(offerPrice: number) {
    if (!offerData) return;

    let price = 0;

    const priceWithDiscount = CalcCouponDiscount({
      couponValue: discountValue!,
      discountType: discountType!,
      priceToApplyDiscount: offerPrice,
    });

    const totalOrderBumps = orderBumpsTotal({
      orderBumpsSelected: orderBumps,
      offerData,
      discountPercent: discountValue ?? 0,
      paymentSelect: paymentSelected ?? "CARD",
    });

    const orderBumpsPrice =
      totalOrderBumps?.priceWithDiscount ?? totalOrderBumps.originalPrice;

    price = priceWithDiscount + orderBumpsPrice;

    setOfferCoupon({
      offerPriceWithDiscount: price,
    });
  }

  const updateInstallmentOptionsFunction = useCallback(() => {
    if (!offerData || !planId || offerPrice === null) return;

    const offerPlanData = getPlanDataSelectedById({ planId, offerData });

    if (!offerPlanData) return;

    const totalOrderBumps = orderBumpsTotal({
      orderBumpsSelected: orderBumps,
      offerData,
      discountPercent: discountValue ?? 0,
      paymentSelect: paymentSelected ?? "CARD",
    });

    let price = offerPrice + totalOrderBumps.originalPrice;

    if (offerPriceWithDiscount) {
      price = offerPriceWithDiscount + (totalOrderBumps.priceWithDiscount ?? 0);
    }

    const options = InstallmentOptionList({
      offerData,
      price,
      fixedInstallmentAmount:
        offerPlanData.periodInNumber ?? offerData.payment.installments,
    });

    updateInstallmentOptions({
      installmentOptions: options,
      initialValue: Number(offerData.customizations.default_installment),
    });
  }, [offerPrice, offerPriceWithDiscount]);

  // // ATUALIZA VALOR COM O PLANO SELECIONADO
  useEffect(() => {
    Boolean(planId) && updateTotalPriceFunction();
  }, [planId, orderBumps]);

  // ATUALIZA VALORES DE PARCELAMENTO
  useEffect(() => {
    offerData && updateInstallmentOptionsFunction();
  }, [offerPrice, offerPriceWithDiscount]);

  useEffect(() => {
    if (!planId && offerData) {
      setOfferPayment({ planId: offerData.payment.plans[0].uuid });
    }

    if (!planId || !offerData) return;

    const planFind = offerData.payment.plans.find((p) => p.uuid === planId);

    if (!planFind) return;

    let price = planFind.charge_first
      ? planFind.price + planFind.subscription_fee_price
      : planFind.price;

    if (!planFind.charge_first && planFind.subscription_fee_price > 0) {
      price = planFind.subscription_fee_price;
    }

    const totalOrderBumps = orderBumpsTotal({
      orderBumpsSelected: orderBumps,
      offerData,
      discountPercent: discountValue ?? 0,
      paymentSelect: paymentSelected ?? "CARD",
    });

    if (couponData) {
      updatePriceWithDiscountFunction(price);
    }

    setOfferPayment({
      offerPrice:
        price +
        (totalOrderBumps.priceWithDiscount ?? totalOrderBumps.originalPrice),
      offerOriginalPrice: price + totalOrderBumps.originalPrice,
    });
  }, [planId, orderBumps]);

  return (
    <div className="flex flex-col gap-5 rounded-[6px] bg-white p-10">
      <h2 className="w-full text-center text-[1rem] text-[#4b4b4b]">
        Resumo da compra
      </h2>
      <PlanList />
      <TotalPlan />
    </div>
  );
}
