import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters, AiOutlineUser } from "react-icons/ai";
import { FiCreditCard } from "react-icons/fi";
import { HiOutlineCalendarDateRange } from "react-icons/hi2";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoLockClosedOutline } from "react-icons/io5";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { fecthMutation } from "@/utils/fetch";
import { CustomInput } from "@/components/custom-inputs-form";
import { CustomSelect } from "@/components/custom-select";
import { iUpsellNewCardPaymentBody, iUpsellNewCardPaymentResponse } from "@/interfaces/upsell";
import { useUpsellNativeStorage } from "@/models/upsell-native/storage";
import { queryClient } from "@/pages/_app";
import { CardFormater } from "@/shared/formaters";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { creditCardSchema } from "./_schema";
import { CardPaymentType } from ".";

interface iNewCardProps {
  option: CardPaymentType;
  onSelect: VoidFunction;
}

export const NewCard = (props: iNewCardProps) => {
  const { option, onSelect } = props;

  return (
    <div
      className="cursor-pointer rounded-[10px] border-[1.5px] border-[#e4e7ec] p-4"
      onClick={onSelect}
    >
      <div className="flex gap-2">
        {option === "new" ? (
          <IoIosCheckmarkCircle
            className="mt-1 ml-[-2px]"
            size={20}
            color="#020246"
          />
        ) : (
          <button
            type="button"
            className="mt-1 h-[15px] max-w-[15px] min-w-[15px] cursor-pointer rounded-full border min-[800px]:h-[20px] min-[800px]:max-w-[20px] min-[800px]:min-w-[20px]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect();
            }}
          />
        )}
        <div className="flex flex-col">
          <h3 className="text-[0.875rem] font-medium text-[#344054]">
            Novo cartão de crédito
          </h3>
          <p className="text-[0.775rem] font-normal text-[#667085]">
            Cadastre um novo cartão de crédito para a compra
          </p>
        </div>
      </div>
      {option === "new" && <NewCard.Form />}
    </div>
  );
};

type iCreditCardForm = z.infer<typeof creditCardSchema>;

NewCard.Form = function () {
  const [installmentSelected, setInstallmentSelected] = useState(12);
  const router = useRouter();

  const { saleItemId, cardData, planSelect, offerSelectUuid } =
    useUpsellNativeStorage();

  if (!saleItemId) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <AiOutlineLoading3Quarters size={30} className="animate-spin" />
      </div>
    );
  }

  const _saleItemId: string = saleItemId;

  const form = useForm<iCreditCardForm>({
    resolver: zodResolver(creditCardSchema),
    mode: "onChange",
  });

  const isPaying =
    queryClient.isMutating({
      mutationKey: ["upsell-payment-by-card-tokenized"],
    }) > 0 ||
    queryClient.isMutating({
      mutationKey: ["upsell-payment-by-new-card"],
    }) > 0;

  const canSubmit =
    typeof _saleItemId === "string" &&
    _saleItemId.length > 0 &&
    typeof offerSelectUuid === "string" &&
    offerSelectUuid.length > 0;

  const { mutate } = fecthMutation<
    iUpsellNewCardPaymentResponse,
    iUpsellNewCardPaymentBody
  >({
    method: "post",
    route: "/payment/upsell/card-new",
    options: {
      mutationKey: ["upsell-payment-by-new-card"],
      onSuccess(data) {
        router.replace(`/payment-thanks/${data.sale_item_id}`);
      },
      onError: () => {
        toast.error("Erro ao processar pagamento");
      },
    },
  });

  function onSubmit(data: iCreditCardForm) {
    if (!canSubmit || isPaying) return;

    mutate({
      offer_id: offerSelectUuid,
      plan_id: planSelect?.uuid ?? null,
      sale_item_id: _saleItemId,
      payment_method: "card",
      installments: Number(installmentSelected),
      card: {
        card_holder: data.cardHolderName,
        card_number: data.cardNumber.replace(/\D/g, ""),
        cvv: data.secreteCardNumber,
        expiration_date: data.cardValidate,
      },
    });
  }

  useEffect(() => {
    if (!cardData) return;
    setInstallmentSelected(cardData.default_installment ?? 12);
  }, [cardData]);

  const installments = (cardData?.installments ?? []).map((item) => ({
    id: uuid(),
    label: `${item.parcel}x de ${item.value.toLocaleString("pt-br", {
      currency: "BRL",
      style: "currency",
    })}${cardData?.studentPaysInterest && "*"}`,
    value: item.parcel,
  }));

  return (
    <motion.div
      className="flex flex-col gap-5"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-3 pb-0"
        >
          <div className="flex flex-col gap-1.5">
            <div>
              <CustomInput
                id="field-card-number"
                className="h-[35px] w-[100%] rounded-[8px] pl-10"
                name="cardNumber"
                placeholder="Número do Cartão"
                control={form.control}
                formater={CardFormater}
                disabled={isPaying}
                icon={
                  <FiCreditCard className="absolute top-2 left-3" size={18} />
                }
                onBlur={() => form.trigger("cardNumber")}
              />
              <CustomInput
                id="field-card-validate"
                className="h-[35px] w-full rounded-[8px] pl-10"
                name="cardValidate"
                placeholder="MM/AA"
                control={form.control}
                formater={CardFormater.CardExpiry}
                disabled={isPaying}
                icon={
                  <HiOutlineCalendarDateRange
                    className="absolute top-2 left-3"
                    size={18}
                  />
                }
                onBlur={() => form.trigger("cardValidate")}
              />
              <CustomInput
                id="field-secrete-card-number"
                className="h-[35px] w-full rounded-[8px] pl-10"
                name="secreteCardNumber"
                placeholder="CVC/CVV"
                control={form.control}
                disabled={isPaying}
                icon={
                  <IoLockClosedOutline
                    className="absolute top-2 left-3"
                    size={18}
                  />
                }
                onBlur={() => form.trigger("secreteCardNumber")}
              />
              <CustomInput
                id="field-holder-name"
                className="h-[35px] w-[100%] rounded-[8px] pl-10"
                name="cardHolderName"
                placeholder="Nome do titular"
                control={form.control}
                disabled={isPaying}
                icon={
                  <AiOutlineUser className="absolute top-2 left-3" size={18} />
                }
                onBlur={() => form.trigger("cardHolderName")}
              />
            </div>

            <CustomSelect
              value={String(installmentSelected)}
              placeholder="Selecionar parcelamento"
              disabled={isPaying}
              data={installments}
              onValueChange={(value) =>
                setInstallmentSelected(
                  Number(value) === 0
                    ? (cardData?.default_installment ?? 12)
                    : Number(value),
                )
              }
            />
          </div>

          <Button
            id="btn-form-submit"
            type="submit"
            disabled={isPaying || !canSubmit}
            className="cursor-pointer rounded-[10px] bg-[#36b90e] py-6 text-[1.12rem] font-normal hover:bg-[#2e9d0c]"
          >
            <span>Comprar agora</span>
            {isPaying && (
              <div className="flex h-full min-h-48 items-center justify-center">
                <AiOutlineLoading3Quarters size={30} className="animate-spin" />
              </div>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
};