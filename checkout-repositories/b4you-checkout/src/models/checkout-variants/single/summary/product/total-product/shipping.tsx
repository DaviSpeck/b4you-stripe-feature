import { motion } from "motion/react";
import { useState } from "react";
import { useOfferCoupon, useOfferShipping } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { findShippingType } from "@/shared/functions/shipping";

export function Shipping() {
  const [prevShippingPrice, setPrevSheppingPrice] = useState<number>(0);

  const { offerData } = useOfferData();
  const { isShippingFree } = useOfferCoupon();
  const { shippingPrice, shippingCompany, shippingOrigin } = useOfferShipping();

  if (!offerData) return;

  if (offerData.payment.type === "subscription") return <></>;

  if (shippingOrigin === "FRENET_FALLBACK") {
    return (
      <motion.div
        className="flex justify-between py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <span className="block text-[0.875rem] font-normal text-[#262626]">
          Frete
        </span>
        <span className="block text-[0.88rem] font-normal text-[#262626]">
          Grátis
        </span>
      </motion.div>
    );
  }

  const shippingType = findShippingType({ offerData });

  const shippingStatus = {
    isCalc: false,
    isFree: false,
    isPrice: false,
  };

  if (shippingType === "FREE" || isShippingFree) {
    shippingStatus.isFree = true;
  } else if (shippingType === "FIX") {
    shippingStatus.isFree = offerData.shipping_price === 0;
    shippingStatus.isPrice = offerData.shipping_price > 0;
  } else if (shippingPrice === null) {
    shippingStatus.isCalc = true;
  } else if (shippingPrice === 0) {
    shippingStatus.isFree = true;
  } else if (shippingPrice > 0) {
    shippingStatus.isPrice = true;
  }

  return (
    <motion.div
      className="flex justify-between py-4"
      initial={
        shippingPrice !== prevShippingPrice ? { opacity: 0, y: -10 } : false
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onAnimationComplete={() => {
        setPrevSheppingPrice(shippingPrice ?? 0);
      }}
    >
      <span className="block text-[0.875rem] font-normal text-[#262626]">
        Frete
      </span>
      <span className="block text-[0.88rem] font-normal text-[#262626]">
        {shippingStatus.isCalc && "A Calcular"}
        {(shippingStatus.isFree || (shippingCompany && shippingPrice === 0)) &&
          "Grátis"}
        {shippingStatus.isPrice &&
          !shippingStatus.isFree &&
          `+${shippingPrice?.toLocaleString("pt-br", {
            currency: "BRL",
            style: "currency",
          })}`}
      </span>
    </motion.div>
  );
}