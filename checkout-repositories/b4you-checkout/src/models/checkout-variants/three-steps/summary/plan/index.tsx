import { useCallback, useEffect } from "react";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iAddressInformationByZipcodeTypeViaCep } from "@/interfaces/address";
import { queryClient } from "@/pages/_app";
import { CalcCouponDiscount } from "@/shared/functions/coupon";
import { orderBumpsTotal } from "@/shared/functions/order-bumps";
import { InstallmentOptionList } from "@/shared/functions/payments";
import { getPlanDataSelectedById } from "@/shared/functions/payments/get-plan-data-selected-by-id";
import {
  findShippingType,
  shippingPriceByRegion,
} from "@/shared/functions/shipping";
import { Card } from "@/components/ui/card";
import { CouponPlan } from "./coupon";
import { OrderBumps } from "./order-bumps";
import { PlanList } from "./plan-list";
import { TotalPlan } from "./total";

export function PlanSummary() {
  const { offerData } = useOfferData();

  const {
    couponData,
    discountValue,
    discountType,
    offerPriceWithDiscount,
    set: setOfferCoupon,
  } = useOfferCoupon();

  const {
    shippingPrice,
    currentZipcode,
    set: setOfferShipping,
  } = useOfferShipping();

  const {
    planId,
    offerPrice,
    paymentSelected,
    orderBumps,
    updateInstallmentOptions,
    set: setOfferPayment,
  } = useOfferPayment();

  const zipcodeDataCache = queryClient.getQueryData([
    "zipcode",
    currentZipcode,
  ]) as iAddressInformationByZipcodeTypeViaCep | null;

  const updateTotalPriceFunction = useCallback(() => {
    if (!offerData || !planId) return;

    const planFind = offerData.payment.plans.find((p) => p.uuid === planId)!;

    let price = planFind.charge_first
      ? planFind.subscription_fee_price + planFind.price
      : planFind.price;

    if (!planFind.charge_first && planFind.subscription_fee_price > 0) {
      price = planFind.subscription_fee_price;
    }

    if (shippingPrice) {
      price += shippingPrice;
    }

    const priceWithDiscount =
      couponData &&
      CalcCouponDiscount({
        couponValue: discountValue!,
        discountType: discountType!,
        priceToApplyDiscount: price,
      });

    const totalOrderBumps = orderBumpsTotal({
      orderBumpsSelected: orderBumps,
      offerData,
      discountPercent: discountValue ?? 0,
      paymentSelect: paymentSelected ?? "CARD",
    });

    const orderBumpsPrice =
      totalOrderBumps?.priceWithDiscount ?? totalOrderBumps.originalPrice;

    price += orderBumpsPrice;

    setOfferPayment({
      planId: planFind.uuid,
      offerPrice: price + (shippingPrice ?? 0),
      offerOriginalPrice: orderBumpsPrice + planFind.price,
    });

    setOfferCoupon({ offerPriceWithDiscount: priceWithDiscount });
  }, [planId, orderBumps.length]);

  const updatePriceWithDiscountFunction = () => {
    if (!offerPrice || !offerData) return;

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
  };

  const updatePriceWithShippingFunction = useCallback(() => {
    if (!offerData || !zipcodeDataCache) return;

    const shippingType = findShippingType({ offerData });

    if (shippingType === "FRENET") {
      return;
    }

    if (shippingType === "REGION" && !couponData) {
      const price = shippingPriceByRegion({
        zipcode: zipcodeDataCache?.cep,
        offerData,
      });
      setOfferShipping({
        shippingPrice: price,
      });
      return;
    }

    if (shippingType === "FIX" && !couponData) {
      setOfferShipping({
        shippingPrice: offerData.shipping_price,
      });
      return;
    }

    if (shippingType === "FREE" && !couponData) {
      setOfferShipping({
        shippingPrice: null,
        shippingFree: true,
      });
      return;
    }
  }, [orderBumps, zipcodeDataCache]);

  const updateInstallmentOptionsFunction = useCallback(() => {
    if (!offerData || !planId || offerPrice === null) return;

    const offerPlanData = getPlanDataSelectedById({ planId, offerData });

    const totalOrderBumps = orderBumpsTotal({
      orderBumpsSelected: orderBumps,
      offerData,
      discountPercent: discountValue ?? 0,
      paymentSelect: paymentSelected ?? "CARD",
    });

    if (!offerPlanData) return;

    let price = offerPrice;

    if (offerPriceWithDiscount) {
      price =
        offerPriceWithDiscount +
        (shippingPrice ?? 0) +
        (totalOrderBumps.priceWithDiscount ?? totalOrderBumps.originalPrice);
    }

    const options = InstallmentOptionList({
      offerData,
      price,
      fixedInstallmentAmount:
        offerPlanData.periodInNumber ?? offerData.payment.installments,
    });

    updateInstallmentOptions({
      installmentOptions: options,
      initialValue: Number(
        offerData.customizations.default_installment ??
          options![options!.length - 1].instalmentNumber,
      ),
    });
  }, [
    offerData,
    shippingPrice,
    offerPrice,
    couponData,
    offerPriceWithDiscount,
  ]);

  // ATUALIZA VALOR COM O PLANO SELECIONADO
  useEffect(() => {
    Boolean(planId) && updateTotalPriceFunction();
  }, [planId, orderBumps]);

  // ATUALIZA VALOR COM CUPOM APLICADO
  useEffect(() => {
    couponData && updatePriceWithDiscountFunction();
  }, [couponData]);

  // ATUALIZA VALORES DE PARCELAMENTO
  useEffect(() => {
    offerData && updateInstallmentOptionsFunction();
  }, [shippingPrice, offerPrice, offerPriceWithDiscount]);

  // ATUALIZA VALOR COM FRETE
  useEffect(() => {
    offerData && updatePriceWithShippingFunction();
  }, [offerData, zipcodeDataCache]);

  return (
    <Card
      className="h-fit w-full border-1 border-[#452427] bg-[#ffffff8c] p-4 min-[760px]:max-w-full min-[1200px]:w-[430px]"
      {...(Boolean(offerData?.checkout?.hex_color) && {
        style: { borderColor: String(offerData?.checkout?.hex_color) },
      })}
    >
      <h2 className="text-[1.125rem] font-medium">Escolha seu plano</h2>
      <PlanList />
      <OrderBumps />
      <CouponPlan />
      <TotalPlan />
    </Card>
  );
}
