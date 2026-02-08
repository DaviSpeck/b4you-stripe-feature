import { motion } from "motion/react";
import { useOfferPayment, useOfferShipping } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";

export function ShippingPrice() {
  const { offerData } = useOfferData();
  const { orderBumps } = useOfferPayment();
  const { shippingFree, shippingPrice } = useOfferShipping();

  if (!offerData) return <></>;

  const orderBumpsFilter = offerData.order_bumps.filter((ob) =>
    orderBumps.includes(ob.uuid),
  );

  const isShipping =
    offerData.product.type === "physical" ||
    orderBumpsFilter.some((ob) => ob.product.type === "physical");

  if (!isShipping) return <></>;

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
      {shippingFree && (
        <span className="block text-[0.88rem] font-normal text-[#262626]">
          Grátis
        </span>
      )}

      {!shippingFree && shippingPrice === null && (
        <span className="block text-[0.88rem] font-normal text-[#262626]">
          A Calcular
        </span>
      )}

      {!shippingFree && shippingPrice !== null && shippingPrice > 0 && (
        <span className="block text-[0.88rem] font-normal text-[#262626]">
          {shippingPrice.toLocaleString("pt-br", {
            currency: "BRL",
            style: "currency",
          })}
        </span>
      )}
    </motion.div>
  );
}
