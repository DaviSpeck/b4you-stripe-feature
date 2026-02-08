import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFetching } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { CustomInput } from "@/components/custom-inputs-form";
import { CustomSelect } from "@/components/custom-select";
import { useInstallmentTwoCards } from "@/hooks/states/checkout/useInstallmentTwoCards";
import { useOfferData } from "@/hooks/states/useOfferData";
import { CardFormater, FormaterCpf } from "@/shared/formaters";
import { FormaterCnpj } from "@/shared/formaters/cnpj";
import { formErrorStorage } from "../storage";
import { FormCreditCardValidation } from "./_schema";
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

export const CardOne = forwardRef<
  {
    execute: () => void;
    focus: () => void;
    reset: () => void;
  },
  iProps
>((props, ref) => {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      document: parseAsString.withDefault(""),
    },
    { clearOnDefault: true },
  );

  const form = useForm<CardInfoType>({
    mode: "onChange",
    resolver: zodResolver(FormCreditCardValidation),
    defaultValues: {
      document: searchParams.document,
    },
  });

  const isFetching = Boolean(useIsFetching());

  const {
    recalcInstallments,
    cardOneInstallmentSelected,
    cardOneInstallments,
  } = useInstallmentTwoCards();

  const { offerData } = useOfferData();
  const { price, totalPrice, otherCardPrice, onPayload, onChangePrice } = props;

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
      cardOneInstallmentSelected: Number(value),
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
      cardOneInstallments: options ?? [],
      ...(!cardOneInstallmentSelected && {
        cardOneInstallmentSelected:
          Number(offerData?.customizations?.default_installment) ?? 12,
      }),
    });
  }, [price]);

  useEffect(() => {
    if (form.formState.errors?.cardNumber) {
      useInstallmentTwoCards.setState({
        lastFourDigitsCardOne: null,
      });
      return;
    }
    useInstallmentTwoCards.setState({
      lastFourDigitsCardOne: form.getValues("cardNumber")?.slice(-4),
    });
  }, [form.formState.errors.cardNumber]);

  useEffect(() => {
    if (!form.formState.isSubmitted) return;
    formErrorStorage.setState({
      isFormError: Object.keys(form.formState.errors).length > 0,
    });
  }, [form.formState.isSubmitted]);

  return (
    <FormProvider {...form}>
      <div className="rounded-[8px] border p-4">
        <div className="pb-4">
          <h3 className="font-medium">Cartão Principal</h3>
        </div>
        <div className="flex items-center">
          <div className="flex flex-col items-start gap-1.5 border-r-2 pr-4 max-[1000px]:w-full max-[1000px]:border-0 max-[1000px]:p-0">
            <div className="w-full">
              <CurrencyInput
                price={price}
                otherCardPrice={otherCardPrice}
                totalOfferPrice={totalPrice}
                onValueChange={onChangePrice}
              />
            </div>
            <CustomInput
              id="field-card-number"
              label="Número do Cartão"
              name="cardNumber"
              placeholder="Digite apenas os números"
              control={form.control}
              formater={CardFormater}
              onBlur={() => form.trigger("cardNumber")}
            />
            <div className="flex items-start gap-2">
              <CustomInput
                id="field-card-validate"
                className="max-w-full rounded-[4px]"
                label="Validade"
                name="cardValidate"
                placeholder="MM/AA"
                control={form.control}
                formater={CardFormater.CardExpiry}
                onBlur={() => form.trigger("cardValidate")}
              />
              <CustomInput
                id="field-secrete-card-number"
                label="CVC/CVV"
                name="secreteCardNumber"
                placeholder="CVC/CVV"
                control={form.control}
                formater={CardFormater.CvvOrCvC}
                onBlur={() => form.trigger("secreteCardNumber")}
              />
            </div>
            <CustomInput
              id="field-holder-name"
              label="Titular do Cartão"
              name="cardHolderName"
              placeholder="Nome do títular"
              control={form.control}
              formater={(value) => value.replace(/[^\p{L} ]/gu, "")}
              onBlur={() => form.trigger("cardHolderName")}
            />
            <CustomInput
              id="field-document-user"
              label={form.watch("isCnpj") ? "CNPJ" : "CPF"}
              name="document"
              placeholder={form.watch("isCnpj") ? "CNPJ" : "CPF"}
              control={form.control}
              formater={form.watch("isCnpj") ? FormaterCnpj : FormaterCpf}
              checkValue={Boolean(form.watch("isCnpj"))}
              checkboxLabel="CNPJ"
              checkboxPosition="in"
              onBlur={() => form.trigger("document")}
              onValueChange={(e) =>
                setSearchParams({
                  document: e.target.value.replace(/[^\d]/g, ""),
                })
              }
              onCheckChenge={(isChecked) => {
                form.setValue("isCnpj", isChecked, { shouldValidate: true });
                form.setValue("document", "", {
                  shouldValidate: form.formState.isSubmitted ? true : false,
                });
              }}
            />
            <div className="flex w-full flex-col gap-2">
              <h3 className="pl-1.5 text-[0.775rem] font-semibold">
                Opções de parcelamento
              </h3>
              <CustomSelect
                value={String(cardOneInstallmentSelected ?? 12)}
                placeholder="Selecionar parcelamento"
                data={cardOneInstallments}
                disabled={isFetching}
                onValueChange={handleInstallmentSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
});
