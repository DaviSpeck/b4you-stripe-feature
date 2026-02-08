import { motion } from "motion/react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { PaymentTypes } from "@/interfaces/offer";

export function PaymentMethodDiscount() {
  const { offerData, getOfferPrice } = useOfferData();
  const { paymentSelected, offerPrice, offerOriginalPrice } = useOfferPayment();

  if (!offerData) return <></>;
  if (!paymentSelected) return <></>;

  const { discount } = getOfferPrice(paymentSelected);

  const methodName: Record<PaymentTypes, string> = {
    CARD: "Cartão",
    PIX: "Pix",
    BANK_SLIP: "Boleto",
    TWO_CARDS: "Dois cartões",
  };

  const method = methodName[paymentSelected];

  return discount === 0 ? (
    <></>
  ) : (
    <motion.div
      className="flex items-center justify-between border-b-[1.5px] border-[#dfdfdf] pb-1.5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <span className="block text-[0.88rem] font-normal text-[#20c374]">
        Desconto {method} ({discount}%):
      </span>
      <span className="block text-[0.88rem] font-normal text-[#20c374]">
        -{" "}
        {Number((offerOriginalPrice ?? 0) - (offerPrice ?? 0)).toLocaleString(
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
