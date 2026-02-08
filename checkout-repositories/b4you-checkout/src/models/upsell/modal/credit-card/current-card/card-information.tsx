import { motion } from "motion/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoCardOutline } from "react-icons/io5";
import { v4 as uuid } from "uuid";
import { fecthMutation } from "@/utils/fetch";
import { CustomSelect } from "@/components/custom-select";
import { installmentOption } from "@/hooks/states/checkout/useOfferPayment";
import {
  iUpsellCardTokenizedPaymentBody,
  iUpsellCardTokenizedPaymentResponse,
} from "@/interfaces/upsell";
import { Button } from "@/components/ui/button";
import { upsellStorage } from "../../storage";

export function CardInformation() {
  const [options, setOptions] = useState<installmentOption[]>([]);

  const params: { sale_item: string; upsell_offer: string } = useParams();

  const { cardData, installmentsValue } = upsellStorage();

  const { mutate } = fecthMutation<
    iUpsellCardTokenizedPaymentResponse,
    iUpsellCardTokenizedPaymentBody
  >({
    method: "post",
    route: "/payment/upsell/card-tokenized",
    options: {
      mutationKey: ["upsell-payment-by-card-tokenized"],
    },
  });

  function handleSubmit() {
    const installment = options.find(
      (options) => options.value === installmentsValue,
    )!;

    mutate({
      offer_id: params.upsell_offer,
      sale_item_id: params.sale_item,
      installments: Number(installment.instalmentNumber),
      payment_method: "card",
      plan_id: "",
    });
  }

  useEffect(() => {
    if (!cardData) return;

    setOptions(
      cardData.card.installments_list.map((option) => ({
        id: uuid(),
        instalmentNumber: option.n,
        label:
          option.n === 1
            ? `${option.n}x ${option.price.toLocaleString("pt-br", { currency: "BRL", style: "currency" })}`
            : `${option.n}x ${option.price.toLocaleString("pt-br", { currency: "BRL", style: "currency" })}*`,
        value: String(option.price),
      })),
    );

    const defaultInstallmentValue =
      cardData.card.installments_list[
        cardData.card.installments_list.length - 1
      ].price;

    upsellStorage.setState({
      installmentsValue: String(defaultInstallmentValue),
    });
  }, [cardData]);

  if (!cardData) return;

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
    >
      <div className="flex flex-col gap-2 pt-4">
        <CardInformation.InputCard
          lastDigits={cardData.card.last_four_digits}
        />
        <CustomSelect
          value={installmentsValue ?? ""}
          placeholder="Selecionar parcelamento"
          data={options}
          onValueChange={(value) =>
            upsellStorage.setState({ installmentsValue: value })
          }
        />
        <Button
          className="cursor-pointer rounded-[10px] bg-[#36b90e] py-6 text-[1.12rem] font-normal hover:bg-[#2e9d0c]"
          id="btn-form-submit"
          type="submit"
          onClick={handleSubmit}
        >
          <span>Comprar agora</span>
        </Button>
      </div>
    </motion.div>
  );
}

interface iInputCardProps {
  lastDigits: string;
}

CardInformation.InputCard = function (props: iInputCardProps) {
  const { lastDigits } = props;

  return (
    <div className="flex items-center gap-5 rounded-[6px] border-[1.5px] px-2.5 py-0.5">
      <IoCardOutline size={20} />
      <div className="flex items-center gap-2">
        <HiOutlineDotsHorizontal size={"30"} />
        <HiOutlineDotsHorizontal size={"30"} />
        <HiOutlineDotsHorizontal size={"30"} />
        <div>{lastDigits}</div>
      </div>
    </div>
  );
};
