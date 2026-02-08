import { motion } from "motion/react";
import { v4 as uuid } from "uuid";
import { useOfferCoupon, useOfferPayment } from "@/hooks/states/checkout";

export function CouponDiscountSummary() {
  const { offerPrice } = useOfferPayment();
  const { discountValue, discountType, offerPriceWithDiscount } =
    useOfferCoupon();

  let discount: string = `${discountValue}%`;

  if (discountType === "cashback") {
    discount = Number(discountValue).toLocaleString("pt-br", {
      currency: "BRL",
      style: "currency",
    });
  }

  return (
    <motion.div
      key={uuid()}
      className="flex items-center justify-between border-b-[1.5px] border-[#dfdfdf] pb-1.5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <span className="block text-[0.88rem] font-normal text-[#20c374]">
        Cupom aplicado ({discount}):
      </span>
      <span className="block text-[0.88rem] font-normal text-[#20c374]">
        -{" "}
        {offerPriceWithDiscount &&
          Number((offerPrice ?? 0) - offerPriceWithDiscount).toLocaleString(
            "pt-br",
            {
              currency: "BRL",
              style: "currency",
            },
          )}
      </span>
    </motion.div>
  );
}
