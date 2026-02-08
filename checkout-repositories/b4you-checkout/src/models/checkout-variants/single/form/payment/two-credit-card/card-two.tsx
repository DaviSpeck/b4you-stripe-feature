import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFetching } from "@tanstack/react-query";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AiOutlineUser } from "react-icons/ai";
import { FiCreditCard } from "react-icons/fi";
import { HiOutlineCalendarDateRange } from "react-icons/hi2";
import { IoLockClosedOutline } from "react-icons/io5";
import { z } from "zod";
import { CustomInput } from "@/components/custom-inputs-form";
import { CustomSelect } from "@/components/custom-select";
import { useInstallmentTwoCards } from "@/hooks/states/checkout/useInstallmentTwoCards";
import { useOfferData } from "@/hooks/states/useOfferData";
import { CardFormater } from "@/shared/formaters";
import { cn } from "@/shared/libs/cn";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { FormCreditCardValidation } from "./_schema";
import { CardPreview } from "./card-preview";
import { CurrencyInput } from "./components/currency-input";

type CardInfoType = z.infer<typeof FormCreditCardValidation>;

interface iProps {
  price: number;
  totalPrice: number;
  otherCardPrice: number;
  onPayload: (
    cardData: CardInfoType & {
      amount: number;
    },
  ) => void;
  onChangePrice: (newValue: number) => void;
}

export const CardTwo = forwardRef<
  {
    execute: () => void;
    focus: () => void;
    reset: () => void;
  },
  iProps
>((props, ref) => {
  const [fieldName, setFieldName] = useState<keyof CardInfoType>("cardNumber");

  const { price, totalPrice, otherCardPrice, onChangePrice, onPayload } = props;

  const { offerData } = useOfferData();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });
  const lastSubmitCountRef = useRef(0);

  const {
    recalcInstallments,
    cardTwoInstallmentSelected,
    cardTwoInstallments,
  } = useInstallmentTwoCards();

  const form = useForm<CardInfoType>({
    mode: "onChange",
    resolver: zodResolver(FormCreditCardValidation),
  });

  const onSubmit = (data: CardInfoType) => {
    if (price + otherCardPrice < (totalPrice ?? 0)) return;
    onPayload({ ...data, amount: price });
  };

  useImperativeHandle(ref, () => ({
    execute: form.handleSubmit(onSubmit),
    focus: () => form.setFocus("cardHolderName"),
    reset: () => form.reset(),
  }));

  function handleInstallmentSelect(value: string) {
    useInstallmentTwoCards.setState({
      cardTwoInstallmentSelected: Number(value),
    });
  }

  useEffect(() => {
    if (!offerData) return;

    const options = recalcInstallments({
      price,
      offer: offerData,
      fixed: offerData.payment.installments,
    });

    useInstallmentTwoCards.setState({
      cardTwoInstallments: options ?? [],
      ...(!cardTwoInstallmentSelected && {
        cardTwoInstallmentSelected:
          Number(offerData?.customizations?.default_installment) ?? 12,
      }),
    });
  }, [price]);

  useEffect(() => {
    if (form.formState.errors?.cardNumber) {
      useInstallmentTwoCards.setState({
        lastFourDigitsCardTwo: null,
      });
      return;
    }
    useInstallmentTwoCards.setState({
      lastFourDigitsCardTwo: form.getValues("cardNumber")?.slice(-4),
    });
  }, [form.formState.errors.cardNumber]);

  useEffect(() => {
    const submitCount = form.formState.submitCount;
    if (submitCount === lastSubmitCountRef.current) return;
    lastSubmitCountRef.current = submitCount;

    if (Object.keys(form.formState.errors).length > 0) {
      trackEvent("checkout_payment_data_error", {
        step: "payment",
        paymentMethod: "credit_card",
      });
    }
  }, [form.formState.submitCount, form.formState.errors, trackEvent]);

  const isFetching = Boolean(useIsFetching());

  return (
    <FormProvider {...form}>
      <div className="rounded-[8px] border p-4">
        <div className="pb-4">
          <h3 className="font-medium">Cartão Secundário</h3>
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-start gap-1.5 border-r-2 pr-4 max-[1000px]:w-full max-[1000px]:border-0 max-[1000px]:p-0">
            <CurrencyInput
              price={price}
              otherCardPrice={otherCardPrice}
              totalOfferPrice={totalPrice}
              onValueChange={onChangePrice}
              disabled={true}
            />
            <CustomInput
              id="field-card-number"
              className="h-9.5 w-full rounded-[4px] pl-10"
              name="cardNumber"
              placeholder="Número do Cartão"
              control={form.control}
              disabled={isFetching}
              formater={CardFormater}
              onBlur={() => form.trigger("cardNumber")}
              onFocus={() => setFieldName("cardNumber")}
              icon={
                <FiCreditCard className="absolute top-2.5 left-3" size={18} />
              }
            />
            <div className="flex w-full items-start gap-2 max-[600px]:flex-col">
              <CustomInput
                id="field-card-validate"
                className="h-9.5 w-full rounded-[4px] pl-10"
                name="cardValidate"
                placeholder="MM/AA"
                control={form.control}
                disabled={isFetching}
                onBlur={() => form.trigger("cardValidate")}
                onFocus={() => setFieldName("cardValidate")}
                formater={CardFormater.CardExpiry}
                icon={
                  <HiOutlineCalendarDateRange
                    className="absolute top-2.5 left-3"
                    size={18}
                  />
                }
              />
              <CustomInput
                id="field-secrete-card-number"
                className="h-9.5 w-full rounded-[4px] pl-10"
                name="secreteCardNumber"
                placeholder="CVC/CVV"
                control={form.control}
                formater={CardFormater.CvvOrCvC}
                disabled={isFetching}
                onBlur={() => form.trigger("secreteCardNumber")}
                onFocus={() => setFieldName("secreteCardNumber")}
                icon={
                  <IoLockClosedOutline
                    className="absolute top-2.5 left-3"
                    size={18}
                  />
                }
              />
            </div>
            <CustomInput
              id="field-holder-name"
              className="h-9.5 w-full rounded-[4px] pl-10"
              name="cardHolderName"
              placeholder="Nome do titular"
              control={form.control}
              disabled={isFetching}
              onBlur={() => form.trigger("cardHolderName")}
              onFocus={() => setFieldName("cardHolderName")}
              icon={
                <AiOutlineUser className="absolute top-2.5 left-3" size={18} />
              }
            />
            <div className="flex w-full flex-col gap-1 pt-2.5">
              <h3 className="pl-1.5 text-[0.775rem] font-semibold">
                Opções de parcelamento
              </h3>
              <CustomSelect
                value={String(cardTwoInstallmentSelected ?? 12)}
                placeholder="Selecionar parcelamento"
                data={cardTwoInstallments}
                disabled={isFetching}
                onValueChange={handleInstallmentSelect}
              />
            </div>
          </div>
          <div className={cn("max-w-75 pl-4 max-[900px]:hidden")}>
            <CardPreview focusField={fieldName} cardData={form.watch()} />
          </div>
        </div>
      </div>
    </FormProvider>
  );
});
