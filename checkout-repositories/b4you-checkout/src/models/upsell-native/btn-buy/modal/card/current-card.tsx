import { motion } from "motion/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoCardOutline } from "react-icons/io5";
import { v4 as uuid } from "uuid";
import { fecthMutation } from "@/utils/fetch";
import { CustomSelect } from "@/components/custom-select";
import {
  iUpsellCardTokenizedPaymentBody,
  iUpsellCardTokenizedPaymentResponse,
} from "@/interfaces/upsell";
import { useUpsellNativeStorage } from "@/models/upsell-native/storage";
import { queryClient } from "@/pages/_app";
import { Button } from "@/components/ui/button";
import { CardPaymentType } from ".";

interface iCurrentCardProps {
  option: CardPaymentType;
  onSelect: VoidFunction;
}

export const CurrentCard = ({ option, onSelect }: iCurrentCardProps) => {
  return (
    <div
      className="cursor-pointer rounded-[10px] border-[1.5px] border-[#e4e7ec] p-4"
      onClick={onSelect}
    >
      <div className="flex gap-2">
        {option === "current" ? (
          <IoIosCheckmarkCircle className="mt-1" size={23} color="#020246" />
        ) : (
          <div className="mt-1 h-[15px] w-[15px] rounded-full border" />
        )}

        <div className="flex flex-col">
          <h3 className="text-[0.875rem] font-medium text-[#344054]">
            Pagar com cartão de crédito
          </h3>
          <p className="text-[0.775rem] font-normal text-[#667085]">
            Pague agora mesmo com seu cartão já utilizado
          </p>
        </div>
      </div>

      {option === "current" && <CurrentCard.Info />}
    </div>
  );
};

CurrentCard.Info = function () {
  const [installmentSelected, setInstallmentSelected] = useState(12);

  const {
    cardData,
    planSelect,
    offerSelectUuid,
    saleItemId,
  } = useUpsellNativeStorage();

  const router = useRouter();

  const canPay =
    typeof saleItemId === "string" &&
    typeof offerSelectUuid === "string";

  const { mutate } = fecthMutation<
    iUpsellCardTokenizedPaymentBody,
    iUpsellCardTokenizedPaymentResponse
  >({
    method: "post",
    route: "/payment/upsell/card-tokenized",
    options: {
      mutationKey: ["upsell-payment-by-card-tokenized"],
      onSuccess(data) {
        router.replace(`/payment-thanks/${data.sale_item_id}`);
      },
    },
  });

  useEffect(() => {
    if (cardData?.default_installment) {
      setInstallmentSelected(cardData.default_installment);
    }
  }, [cardData]);

  const installments = (cardData?.installments ?? []).map((item) => ({
    id: uuid(),
    label: `${item.parcel}x de ${item.value.toLocaleString("pt-br", {
      currency: "BRL",
      style: "currency",
    })}${cardData?.studentPaysInterest && "*"}`,
    value: item.parcel,
  }));

  const isPaying =
    queryClient.isMutating({
      mutationKey: ["upsell-payment-by-card-tokenized"],
    }) > 0 ||
    queryClient.isMutating({
      mutationKey: ["upsell-payment-by-new-card"],
    }) > 0;

  function handleSubmit() {
    if (!canPay || isPaying) return;

    mutate({
      offer_id: offerSelectUuid,
      plan_id: planSelect?.uuid ?? null,
      sale_item_id: saleItemId,
      payment_method: "card",
      installments: Number(installmentSelected),
    });
  }

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
    >
      <div className="flex flex-col gap-2 pt-4">
        <div className="flex items-center gap-2 rounded-[6px] border-[1.5px] px-2.5 py-0.5">
          <IoCardOutline />
          <div className="flex items-center gap-1">
            <HiOutlineDotsHorizontal className="text-[2rem]" />
            <HiOutlineDotsHorizontal className="text-[2rem]" />
            <HiOutlineDotsHorizontal className="text-[2rem]" />
            <div className="text-[0.875rem]">
              {cardData?.lastFourDigits}
            </div>
          </div>
        </div>

        <CustomSelect
          value={String(installmentSelected)}
          placeholder="Selecionar parcelamento"
          data={installments}
          disabled={isPaying}
          onValueChange={(value) =>
            setInstallmentSelected(Number(value))
          }
        />

        <Button
          className="cursor-pointer rounded-[10px] bg-[#36b90e] py-6 text-[1.12rem] font-normal hover:bg-[#2e9d0c]"
          disabled={isPaying}
          onClick={handleSubmit}
        >
          <span>Comprar agora</span>
          {isPaying && (
            <AiOutlineLoading3Quarters size={30} className="animate-spin" />
          )}
        </Button>
      </div>
    </motion.div>
  );
};