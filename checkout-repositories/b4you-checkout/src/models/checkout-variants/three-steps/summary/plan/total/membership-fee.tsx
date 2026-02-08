import { motion } from "motion/react";
import { iOffer } from "@/interfaces/offer";

interface iProps {
  plan: iOffer["payment"]["plans"][0];
}

export function MembershipFee(props: iProps) {
  const { plan } = props;

  if (plan.subscription_fee_price === 0) return <></>;

  return (
    <motion.div
      className="flex items-center justify-between border-b-[1.5px] border-[#dfdfdf] pb-1.5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <span className="block text-[0.88rem] font-normal">Valor de Adesão:</span>
      <span className="block text-[0.88rem] font-normal">
        +{" "}
        {plan.subscription_fee_price.toLocaleString("pt-br", {
          currency: "BRL",
          style: "currency",
        })}
      </span>
    </motion.div>
  );
}
