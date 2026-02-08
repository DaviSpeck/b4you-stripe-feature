import { motion } from "motion/react";
import { memo, useState } from "react";
import { v4 as uuid } from "uuid";
import { useOfferCoupon, useOfferShipping } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { findShippingType } from "@/shared/functions/shipping";

export const ShippingPriceSummary = memo(() => {
  const [prevShippingPrice, setPrevSheppingPrice] = useState<number>(0);

  const { offerData } = useOfferData();
  const { isShippingFree } = useOfferCoupon();
  const {
    shippingPrice,
    shippingCompany,
    shippingOrigin,
  } = useOfferShipping();

  if (!offerData) return;

  if (offerData.payment.type === "subscription") return <></>;

  if (shippingOrigin === "FRENET_FALLBACK") {
    return (
      <motion.div
        className="flex justify-between border-b-[1.5px] border-[#dfdfdf] pb-1.5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <span className="block text-[0.88rem] font-normal text-[#262626]">
          Frete
        </span>
        <span className="block text-[0.88rem] font-normal text-[#262626]">
          Grátis
        </span>
      </motion.div>
    );
  }

  const shippingType = findShippingType({ offerData });

  const shippingStatus: Record<"isCalc" | "isFree" | "isPrice", boolean> = {
    isCalc: true,
    isFree: false,
    isPrice: false,
  };

  if (shippingType !== "FREE" && shippingPrice === null) {
    shippingStatus.isCalc = true;
  }

  if (shippingPrice === 0 && shippingType !== "FREE") {
    shippingStatus.isCalc = false;
    shippingStatus.isFree = true;
  }

  if (shippingType !== "FREE" && shippingPrice && shippingPrice > 0) {
    shippingStatus.isCalc = false;
    shippingStatus.isPrice = true;
  }

  if (isShippingFree || shippingType === "FREE") {
    shippingStatus.isCalc = false;
    shippingStatus.isFree = true;
  }

  return (
    <motion.div
      className="flex justify-between border-b-[1.5px] border-[#dfdfdf] pb-1.5"
      key={uuid()}
      initial={
        shippingPrice !== prevShippingPrice ? { opacity: 0, y: -10 } : false
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onAnimationComplete={() => {
        setPrevSheppingPrice(shippingPrice ?? 0);
      }}
    >
      <span className="block text-[0.88rem] font-normal text-[#262626]">
        Frete
      </span>
      <span className="block text-[0.88rem] font-normal text-[#262626]">
        {shippingStatus.isCalc && "A Calcular"}
        {shippingStatus.isFree && "Grátis"}
        {shippingStatus.isPrice &&
          `+ ${shippingPrice?.toLocaleString("pt-br", {
            currency: "BRL",
            style: "currency",
          })}`}
      </span>
    </motion.div>
  );
});