import { useEffect } from "react";
import { TbShoppingCart } from "react-icons/tb";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { usePixelStates } from "@/hooks/states/usePixel";
import { CalcCouponDiscount } from "@/shared/functions/coupon";
import { orderBumpsTotal } from "@/shared/functions/order-bumps";
import { InstallmentOptionList } from "@/shared/functions/payments";
import { findShippingType } from "@/shared/functions/shipping";
import { Card } from "@/components/ui/card";
import { Coupon } from "./coupon";
import { ProductList } from "./product-list";
import { TotalSummary } from "./total";

export function ProductSummary() {
  const { set: setOfferData, offerData, getOfferPrice } = useOfferData();

  const { set: setPixelStates } = usePixelStates();

  const { shippingPrice, set: setOfferShipping } = useOfferShipping();

  const {
    offerPriceWithDiscount,
    couponData,
    discountType,
    discountValue,
    set: setOfferCoupon,
  } = useOfferCoupon();

  const {
    set: setOfferPayment,
    updateInstallmentOptions,
    offerPrice,
    orderBumps,
    paymentSelected,
    planId,
  } = useOfferPayment();

  // EFFECT RESPONÁVEL POR ADICIONAR VALOR INICIAL DA OFERTA
  useEffect(() => {
    if (!offerData) return;

    if (!offerData) {
      setOfferData(offerData);
    }

    const planInitialSelected = offerData.payment.plans.sort(
      (a, b) => b.subscription_fee_price - a.subscription_fee_price,
    )[0];

    const shippingType = findShippingType({ offerData });

    if (shippingType === "FREE" || shippingType === "FIX") {
      setOfferShipping({
        shippingFree: shippingType === "FREE" ? true : false,
        shippingPrice:
          shippingType === "FREE" ? null : offerData.shipping_price,
      });
    }

    if (planInitialSelected) {
      setOfferPayment({
        planId: planInitialSelected?.uuid ?? null,
        offerPrice:
          planInitialSelected.subscription_fee_price > 0
            ? planInitialSelected.subscription_fee_price
            : planInitialSelected.price,
      });
    }

    if (offerData.payment.methods.includes("credit_card")) {
      const { price } = getOfferPrice("CARD");
      setOfferPayment({ paymentSelected: "CARD" });
      !planInitialSelected &&
        setOfferPayment({
          offerPrice: price,
        });
      return;
    }

    if (offerData.payment.methods.includes("pix")) {
      const { price } = getOfferPrice("PIX");
      setOfferPayment({ paymentSelected: "PIX" });

      !planInitialSelected &&
        setOfferPayment({
          offerPrice: price,
        });

      return;
    }

    if (offerData.payment.methods.includes("billet")) {
      const { price } = getOfferPrice("BANK_SLIP");
      setOfferPayment({ paymentSelected: "BANK_SLIP" });

      !planInitialSelected &&
        setOfferPayment({
          offerPrice: price,
        });

      return;
    }
  }, [offerData]);

  // EFFECT RESPONÁVEL POR CONTROLAR VALORES DE PARCELA NO CARTÃO
  useEffect(() => {
    if (!offerData || !offerPrice) return;

    const { discount } = getOfferPrice(
      paymentSelected ?? "BANK_SLIP",
      planId ?? null,
    );

    let price = offerPriceWithDiscount ?? offerPrice;

    if (discount === 0) {
      price = offerPrice;
    }

    const options = InstallmentOptionList({
      offerData,
      price: (price ?? 0) + (shippingPrice ?? 0),
      fixedInstallmentAmount: offerData?.payment.installments ?? 0,
    });

    setPixelStates({ shippingPrice: (price ?? 0) + (shippingPrice ?? 0) });

    updateInstallmentOptions({
      installmentOptions: options,
      initialValue: Number(offerData.customizations.default_installment),
    });
  }, [offerPrice, shippingPrice, planId, offerPriceWithDiscount, offerData]);

  // EFFECT RESPONSÁVEL POR CONTROLAR O VALOR TOTAL DA COMPRA E VALOR COM DESCONTO
  useEffect(() => {
    if (!offerData || !paymentSelected) return;

    const { price, discount } = getOfferPrice(paymentSelected, planId);

    const totalOrderBumps = orderBumpsTotal({
      orderBumpsSelected: orderBumps,
      offerData,
      discountPercent: discount,
      paymentSelect: paymentSelected ?? "CARD",
    });

    const offerBumpsPrice = Math.abs(
      totalOrderBumps.priceWithDiscount ?? totalOrderBumps.originalPrice,
    );

    let offerTotal = offerBumpsPrice + price;

    const plan = offerData.payment.plans.find(
      (option) => option.uuid === planId,
    );

    const planPrice =
      plan?.subscription_fee_price === 0
        ? plan.price
        : plan?.subscription_fee_price;

    if (plan && planPrice) {
      offerTotal = planPrice + offerBumpsPrice;
    }

    if (couponData) {
      const offerPriceWithDiscount = CalcCouponDiscount({
        couponValue: discountValue!,
        discountType: discountType!,
        priceToApplyDiscount: offerTotal,
      });

      setOfferCoupon({ offerPriceWithDiscount });
    }

    setOfferPayment({
      planId: plan?.uuid,
      offerPrice: offerTotal,
      offerOriginalPrice:
        totalOrderBumps.originalPrice +
        (plan ? (planPrice ?? 0) : offerData.original_price),
    });
  }, [orderBumps, paymentSelected, shippingPrice, planId]);

  if (!offerData) return <></>;

  return (
    <Card
      className="h-fit w-full border-1 border-[#452427] bg-[#ffffff8c] p-4 min-[760px]:max-w-full min-[1200px]:w-[430px]"
      {...(Boolean(offerData?.checkout?.hex_color) && {
        style: { borderColor: String(offerData?.checkout?.hex_color) },
      })}
    >
      <header className="flex items-center gap-2">
        <TbShoppingCart
          size={25}
          color={
            offerData?.checkout?.hex_color
              ? String(offerData?.checkout?.hex_color)
              : "#452427"
          }
        />
        <h2
          className="text-[1.12rem] font-semibold text-[#452427]"
          {...(Boolean(offerData?.checkout?.hex_color) && {
            style: { color: String(offerData?.checkout?.hex_color) },
          })}
        >
          Resumo
        </h2>
      </header>
      <ProductList />
      <Coupon />
      <TotalSummary />
    </Card>
  );
}
