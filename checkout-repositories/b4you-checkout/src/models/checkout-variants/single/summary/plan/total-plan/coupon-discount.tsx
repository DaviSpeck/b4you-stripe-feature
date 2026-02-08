import { motion } from "motion/react";
import { v4 as uuid } from "uuid";
import { useOfferCoupon } from "@/hooks/states/checkout";

export function CouponDiscount() {
  const { couponData, discountType, discountValue, offerPriceWithDiscount } =
    useOfferCoupon.getState();

  let discount: string = `${discountValue}%`;

  if (discountType === "cashback") {
    discount = Number(discountValue).toLocaleString("pt-br", {
      currency: "BRL",
      style: "currency",
    });
  }

  if (!offerPriceWithDiscount || !couponData) return <></>;

  return (
    <motion.div
      key={uuid()}
      className="flex justify-between pb-4 text-[0.875rem] text-[#20c374]"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <span className="block">
        {couponData.amount > 0
          ? "Cupom aplicado:"
          : `Cupom aplicado (${discount}):`}
      </span>
      <span className="block">
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
