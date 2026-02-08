import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFetching } from "@tanstack/react-query";
import { motion } from "motion/react";
import { parseAsString, useQueryStates } from "nuqs";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { CustomInput } from "@/components/custom-inputs-form";
import { CustomSelect } from "@/components/custom-select";
import { CreditCardPaymentProcess } from "@/components/payment-process/credit-card";
import { paymentCreditCardDataType } from "@/components/payment-process/credit-card/interface";
import { PixPaymentProcess } from "@/components/payment-process/pix";
import { paymentPixDataType } from "@/components/payment-process/pix/interface";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps";
import { useKonduto } from "@/hooks/states/useKonduto";
import { useOfferData } from "@/hooks/states/useOfferData";
import { CardFormater, FormaterCpf } from "@/shared/formaters";
import { FormaterCnpj } from "@/shared/formaters/cnpj";
import { cn } from "@/shared/libs/cn";
import { getFingerprint } from "@/shared/visitor-id";
import { Label } from "@/components/ui/label";
import { formErrorStorage } from "../storage";
import { FormCreditCardBase, FormCreditCardValidation } from "./_schema";
import "react-credit-cards-2/dist/es/styles-compiled.css";

export type CardInfoType = z.infer<typeof FormCreditCardBase>;

interface iPayload extends Omit<paymentCreditCardDataType, "card" | "address"> {
  address?: paymentCreditCardDataType["address"];
  plan_id: string | null;
  integration_shipping_price: number | null;
  integration_shipping_company: string | null;
  params: {
    src?: string;
    sck?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
}

export const FormCardInformations = forwardRef<{
  execute: () => void;
}>((_, ref) => {
  const [paymentPayload, setPaymentPayload] = useState<null | iPayload>(null);
  const [searchParams] = useQueryStates({
    b4f: parseAsString.withDefault(""),
    src: parseAsString.withDefault(""),
    sck: parseAsString.withDefault(""),
    document: parseAsString.withDefault(""),
    utm_campaign: parseAsString.withDefault(""),
    utm_content: parseAsString.withDefault(""),
    utm_source: parseAsString.withDefault(""),
    utm_medium: parseAsString.withDefault(""),
    utm_term: parseAsString.withDefault(""),
  });

  const { couponData } = useOfferCoupon();
  const { visitorId: kondutoId } = useKonduto();
  const { frenetShippingOptions, shippingPrice } = useOfferShipping();
  const { firstStepFormData, secondStepFormData } = useOfferCheckoutSteps();
  const { planId, orderBumps, consumeTurnstileToken } = useOfferPayment();
  const { installmentOptions, installmentSelectedValue, set } =
    useOfferPayment();

  const cardFlagsUriArr = [
    "/card-flags/paymentmethodslightamericanexpress3203-2jw4.svg",
    "/card-flags/paymentmethodslightdinersclub3203-nqz8.svg",
    "/card-flags/paymentmethodslightdiscover3203-b54o.svg",
    "/card-flags/paymentmethodslightelo3203-zmb.svg",
    "/card-flags/paymentmethodslighthipercard3203-5i8.svg",
    "/card-flags/paymentmethodslightjcb3203-m7i.svg",
    "/card-flags/paymentmethodslightmaestro3203-r2a9.svg",
    "/card-flags/paymentmethodslightmastercard3203-sf1i.svg",
    "/card-flags/paymentmethodslightvisa3203-l31s.svg",
  ];

  const form = useForm<CardInfoType>({
    mode: "onChange",
    resolver: zodResolver(FormCreditCardValidation),
    defaultValues: {
      document: searchParams.document,
    },
  });

  const { offerData } = useOfferData();
  const { paymentSelected } = useOfferPayment();

  const onSubmit = async (data: CardInfoType) => {
    if (!firstStepFormData) return;

    const turnstileToken = consumeTurnstileToken();
    if (!turnstileToken) return;

    const id = await getFingerprint();

    const visitorId = `${id}-${kondutoId}`;
    const sessionID = uuid()?.replace(/-/g, "").substring(0, 21);

    const findInstallment = installmentOptions?.find(
      (option) => option.value === String(installmentSelectedValue),
    );

    const documentValue = form.watch("document") || searchParams.document;

    const payload: iPayload = {
      ...firstStepFormData,
      whatsapp: firstStepFormData!.whatsapp.replace(/[^0-9]/g, ""),
      document_number: documentValue?.replace(/[^0-9]/g, ""),
      offer_id: offerData!.uuid,
      order_bumps: orderBumps,
      coupon: couponData?.coupon ?? null,
      b4f: Boolean(searchParams.b4f) ? searchParams.b4f : null,
      type: offerData!.payment.type,
      token: String(turnstileToken),
      payment_method: "card",
      integration_shipping_company: null,
      integration_shipping_price: null,
      plan_id: planId,
      visitorId,
      sessionID,
      params: {},
      cards: [
        {
          card_number: data.cardNumber?.replace(/[^0-9]/g, ""),
          card_holder: data.cardHolderName,
          expiration_date: data.cardValidate,
          cvv: data.secreteCardNumber?.replace(/[^0-9]/g, ""),
          document_number: data.document?.replace(/[^0-9]/g, ""),
          installments: findInstallment?.instalmentNumber ?? 12,
        },
      ],
    };

    Object.entries({
      src: searchParams.src,
      sck: searchParams.sck,
      utm_source: searchParams.utm_source,
      utm_medium: searchParams.utm_medium,
      utm_campaign: searchParams.utm_campaign,
      utm_term: searchParams.utm_term,
      utm_content: searchParams.utm_content,
    }).forEach(([key, value]) => {
      if (Boolean(value)) {
        payload.params[key as keyof typeof payload.params] = value;
      }
    });

    if (offerData?.has_frenet) {
      const frenetSelect = frenetShippingOptions.find(
        (option) => option.price === shippingPrice,
      );
      payload.integration_shipping_company = frenetSelect?.company ?? null;
      payload.integration_shipping_price = frenetSelect?.price ?? null;
    }

    if (offerData?.require_address && secondStepFormData) {
      payload.address = {
        ...secondStepFormData,
        number: secondStepFormData.number_address,
      } as paymentCreditCardDataType["address"];
    }

    setPaymentPayload(payload);
  };

  useEffect(() => {
    if (!form.formState.isSubmitted) return;
    formErrorStorage.setState({
      isFormError: Object.keys(form.formState.errors).length > 0,
    });
  }, [form.formState.isSubmitted]);

  useImperativeHandle(ref, () => ({
    execute: form.handleSubmit(onSubmit),
  }));

  if (!offerData) return;

  async function buildPixPayload(): Promise<iPayload | null> {
    if (!offerData || !firstStepFormData) return null;

    const turnstileToken = consumeTurnstileToken();
    if (!turnstileToken) return null;

    const documentValue = form.watch("document") || searchParams.document;
    const id = await getFingerprint();
    const visitorId = `${id}-${kondutoId}`;
    const sessionID = uuid()?.replace(/-/g, "").substring(0, 21);

    const findInstallment = installmentOptions?.find(
      (option) => option.value === String(installmentSelectedValue),
    );

    return {
      ...firstStepFormData,
      whatsapp: firstStepFormData.whatsapp.replace(/[^0-9]/g, ""),
      document_number: documentValue?.replace(/[^0-9]/g, ""),
      offer_id: offerData.uuid,
      order_bumps: orderBumps,
      coupon: couponData?.coupon ?? null,
      b4f: Boolean(searchParams.b4f) ? searchParams.b4f : null,
      type: offerData.payment.type,
      token: String(turnstileToken),
      payment_method: "pix",
      plan_id: planId,
      visitorId,
      sessionID,
      params: {},
      integration_shipping_company: null,
      integration_shipping_price: null,
      cards: [
        {
          card_number: form.watch("cardNumber")?.replace(/[^0-9]/g, ""),
          card_holder: form.watch("cardHolderName"),
          expiration_date: form.watch("cardValidate"),
          cvv: form.watch("secreteCardNumber")?.replace(/[^0-9]/g, ""),
          document_number: documentValue?.replace(/[^0-9]/g, ""),
          installments: findInstallment?.instalmentNumber ?? 12,
        },
      ],
    };
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        !offerData.payment.methods.includes("credit_card") && "hidden",
      )}
      {...(paymentSelected !== "CARD" && {
        onClick: () => {
          form.clearErrors();
          set({ paymentSelected: "CARD" });
        },
      })}
    >
      <div className="w-full">
        <div
          className={
            "flex w-full items-center space-x-3 rounded-md bg-[#f9f9f9] p-3"
          }
        >
          <input type="radio" checked={paymentSelected === "CARD"} />
          <div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="payment-method-card">Cartão</Label>
              <div className="flex gap-1">
                {cardFlagsUriArr.map((uri) => (
                  <img key={uuid()} src={uri} width="22px" height="15px" />
                ))}
              </div>
            </div>
            <span className="text-[0.75rem] leading-0 font-medium text-[#20c374]">
              Em até {offerData.payment.installments}x
            </span>
          </div>
        </div>
      </div>
      {paymentSelected === "CARD" && (
        <FormProvider {...form}>
          <CardForm
            paymentPayload={paymentPayload}
            onSetPayload={(payload) => setPaymentPayload(payload)}
            onRequestPix={async () => {
              const payload = await buildPixPayload();
              if (!payload) return;

              setPaymentPayload(payload);
            }}
          />
        </FormProvider>
      )}
    </div>
  );
});

interface iCardFormProps {
  paymentPayload: iPayload | null;
  onSetPayload(payload: iPayload | null): void;
  onRequestPix(): Promise<void>;
}

const CardForm = (props: iCardFormProps) => {
  const [_, setSearchParams] = useQueryStates(
    {
      document: parseAsString.withDefault(""),
    },
    { clearOnDefault: true },
  );
  const [isPixPayment, setPixPayment] = useState<boolean>(false);
  const pendingSubmitRef = useRef<null | (() => void)>(null);

  const { paymentPayload, onSetPayload } = props;

  const form = useFormContext<CardInfoType>();

  const { offerData } = useOfferData();
  const { shippingPrice } = useOfferShipping();
  const {
    set: setPayment,
    startCaptcha,
    getValidTurnstileToken,
    isTurnstileTokenValid,
  } = useOfferPayment();
  const { installmentOptions, installmentSelectedValue, set } =
    useOfferPayment();

  const isFetching = Boolean(useIsFetching());

  function handleInstallmentSelect(value: string) {
    set({ installmentSelectedValue: Number(value) });
  }

  function payloadFormatterPix(): paymentPixDataType {
    return {
      ...paymentPayload!,
      payment_method: "pix",
    };
  }

  function onReview() {
    onSetPayload(null);
    setPayment({ isPaying: false });
    form.setFocus("cardHolderName");
  }

  function onAddNewCard() {
    onSetPayload(null);
    form.setFocus("cardHolderName");
    form.reset();
  }

  useEffect(() => {
    if (!pendingSubmitRef.current) return;
    if (!getValidTurnstileToken()) return;

    const submit = pendingSubmitRef.current;
    pendingSubmitRef.current = null;

    submit();
  }, [getValidTurnstileToken]);

  useEffect(() => {
    if (!paymentPayload) return;

    if (paymentPayload.payment_method === "pix") {
      setPixPayment(true);
    } else {
      setPixPayment(false);
    }
  }, [paymentPayload]);

  return (
    <>
      <FormProvider {...form}>
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <div className="flex w-full flex-col items-start gap-2 py-2">
            <CustomInput
              id="field-card-number"
              label="Número do Cartão"
              name="cardNumber"
              placeholder="Digite apenas os números"
              control={form.control}
              formater={CardFormater}
              onBlur={() => form.trigger("cardNumber")}
            />
            <div className="flex w-full items-start gap-2">
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
                value={String(installmentSelectedValue)}
                placeholder="Selecionar parcelamento"
                data={installmentOptions ?? []}
                disabled={isFetching}
                onValueChange={handleInstallmentSelect}
              />
            </div>
          </div>
        </motion.div>
      </FormProvider>
      {!isPixPayment && (
        <CreditCardPaymentProcess
          startPayment={Boolean(paymentPayload)}
          paymentInformations={paymentPayload}
          onReview={onReview}
          onAddNewCard={onAddNewCard}
          onSucess={() => setPayment({ isPaid: true })}
          onRequestPix={() => {
            pendingSubmitRef.current = async () => {
              await props.onRequestPix();
            };

            if (!isTurnstileTokenValid()) {
              startCaptcha();
              return;
            }

            pendingSubmitRef.current();
            pendingSubmitRef.current = null;
          }}
        />
      )}
      <PixPaymentProcess
        startPayment={isPixPayment}
        shippingPrice={shippingPrice ?? 0}
        paymentInformations={payloadFormatterPix()}
        offerUuid={offerData?.uuid ?? ""}
        onSucess={() => {
          setPayment({
            isPaying: false,
            isPixGenerate: true,
            isPaid: false,
          });
        }}
      />
    </>
  );
};
