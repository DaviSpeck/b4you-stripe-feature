import { motion } from "motion/react";
import { useOfferCoupon } from "@/hooks/states/checkout";
// import { useOfferCoupon, useOfferPayment } from "@/hooks/states/checkout";

export function DiscountByApplyCoupon() {
  const { couponData, offerPriceWithDiscount, discountValue, discountType } =
    useOfferCoupon();

  if (!couponData) return <></>;

  let discount: string = `${discountValue}%`;

  if (discountType === "cashback") {
    discount = Number(discountValue).toLocaleString("pt-br", {
      currency: "BRL",
      style: "currency",
    });
  }

  return (
    <motion.div
      className="flex items-center justify-between border-b-[1.5px] border-[#dfdfdf] pb-1.5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <span className="block text-[0.88rem] font-normal text-[#20c374]">
        {couponData.amount > 0
          ? "Cupom aplicado:"
          : `Cupom aplicado (${discount}):`}
      </span>
      <span className="block text-[0.88rem] font-normal text-[#20c374]">
        - {couponData.amount > 0 && discount}
        {couponData.amount === 0 &&
          (offerPriceWithDiscount ?? 0).toLocaleString("pt-br", {
            currency: "BRL",
            style: "currency",
          })}
      </span>
    </motion.div>
  );
}
