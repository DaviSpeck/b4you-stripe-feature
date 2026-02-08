import { motion } from "motion/react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { PaymentTypes } from "@/interfaces/offer";

export function DiscountByPaymentItem() {
  const { paymentSelected } = useOfferPayment();

  const methodName: Record<PaymentTypes, string> = {
    CARD: "Cartão",
    PIX: "Pix",
    BANK_SLIP: "Boleto",
    TWO_CARDS: "Dois cartões",
  };

  return (
    <motion.div
      className="flex items-center justify-between border-b-[1.5px] border-[#dfdfdf] pb-1.5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <span className="block text-[0.88rem] font-normal text-[#20c374]">
        {/* Desconto {methodName[paymentSelected ?? "CARD"]} ({discount}%): */}
        Desconto {methodName[paymentSelected ?? "CARD"]} (50%):
      </span>
      <span className="block text-[0.88rem] font-normal text-[#20c374]">
        -{" "}
        {(100).toLocaleString("pt-br", {
          currency: "BRL",
          style: "currency",
        })}
      </span>
    </motion.div>
  );
}
