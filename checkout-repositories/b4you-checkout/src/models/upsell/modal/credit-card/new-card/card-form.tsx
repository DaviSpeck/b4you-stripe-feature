import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { useRouter } from "next/router";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters, AiOutlineUser } from "react-icons/ai";
import { FiCreditCard } from "react-icons/fi";
import { HiOutlineCalendarDateRange } from "react-icons/hi2";
import { IoLockClosedOutline } from "react-icons/io5";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import z from "zod";
import { fecthMutation } from "@/utils/fetch";
import { getQueryParam } from "@/utils/get-query-param";
import { CustomInput } from "@/components/custom-inputs-form";
import { CustomSelect } from "@/components/custom-select";
import { installmentOption } from "@/hooks/states/checkout/useOfferPayment";
import {
  iUpsellNewCardPaymentBody,
  iUpsellNewCardPaymentResponse,
} from "@/interfaces/upsell";
import { CardFormater } from "@/shared/formaters";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { upsellStorage } from "../../storage";
import { creditCardSchema } from "./_schema";

type iCreditCardForm = z.infer<typeof creditCardSchema>;

export function CardForm() {
  const [options, setOptions] = useState<installmentOption[]>([]);

  const [searchParams] = useQueryStates({
    plan_id: parseAsString.withDefault(""),
  });

  const router = useRouter();

  const offerId = getQueryParam(router.query.offer_id);
  const saleItemId = getQueryParam(router.query.sale_item_id);

  if (!offerId || !saleItemId) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <AiOutlineLoading3Quarters size={30} className="animate-spin" />
      </div>
    );
  }

  const { cardData, installmentsValue } = upsellStorage();

  const form = useForm<iCreditCardForm>({
    resolver: zodResolver(creditCardSchema),
    mode: "onChange",
  });

  const { mutate } = fecthMutation<
    iUpsellNewCardPaymentResponse,
    iUpsellNewCardPaymentBody
  >({
    method: "post",
    route: "/payment/upsell/card-new",
    options: {
      mutationKey: ["upsell-payment-by-card-tokenized"],
      onError: () => {
        toast.error("Cartão inválido, verifique os dados do cartão");
      },
    },
  });

  const _saleItemId: string = saleItemId;

  function onSubmit(data: iCreditCardForm) {
    mutate({
      offer_id: offerId,
      plan_id: searchParams.plan_id,
      sale_item_id: _saleItemId,
      payment_method: "card",
      installments: 1,
      card: {
        card_holder: data.cardHolderName,
        card_number: data.cardNumber,
        cvv: data.secreteCardNumber,
        expiration_date: data.cardValidate,
      },
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
                onBlur={() => form.trigger("cardNumber")}
                icon={
                  <FiCreditCard className="absolute top-2 left-3" size={18} />
                }
              />
              <CustomInput
                id="field-card-validate"
                className="h-[35px] w-full rounded-[8px] pl-10"
                name="cardValidate"
                placeholder="MM/AA"
                control={form.control}
                formater={CardFormater.CardExpiry}
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
                icon={
                  <AiOutlineUser className="absolute top-2 left-3" size={18} />
                }
                onBlur={() => form.trigger("cardHolderName")}
              />
            </div>
            <CustomSelect
              value={String(installmentsValue)}
              placeholder="Selecionar parcelamento"
              data={options}
              onValueChange={(value) =>
                upsellStorage.setState({ installmentsValue: value })
              }
            />
          </div>
          <Button
            id="btn-form-submit"
            type="submit"
            className="cursor-pointer rounded-[10px] bg-[#36b90e] py-6 text-[1.12rem] font-normal hover:bg-[#2e9d0c]"
          >
            <span>Comprar agora</span>
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}