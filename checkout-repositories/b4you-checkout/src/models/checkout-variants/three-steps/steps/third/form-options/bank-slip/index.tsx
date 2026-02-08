import { zodResolver } from "@hookform/resolvers/zod";
import { parseAsString, useQueryStates } from "nuqs";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { AiOutlineBarcode } from "react-icons/ai";
import { v4 as uuid } from "uuid";
import z from "zod";
import { CustomInput } from "@/components/custom-inputs-form";
import { BankSlipPaymenProcess } from "@/components/payment-process/bank-slip";
import { paymentCreditCardDataType } from "@/components/payment-process/credit-card/interface";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps";
import { useKonduto } from "@/hooks/states/useKonduto";
import { useOfferData } from "@/hooks/states/useOfferData";
import { FormaterCpf } from "@/shared/formaters";
import { cn } from "@/shared/libs/cn";
import { getFingerprint } from "@/shared/visitor-id";
import { Label } from "@/components/ui/label";
import { formErrorStorage } from "../storage";
import { FormBankSlipValidation } from "./_schema";

type formBankSlipType = z.infer<typeof FormBankSlipValidation>;

interface iPayload extends Omit<paymentCreditCardDataType, "address"> {
  address?: paymentCreditCardDataType["address"];
  plan_id: string | null;
  payment_method: "billet";
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

export const FormBankSlipInformation = forwardRef<{
  execute: () => void;
}>((_, ref) => {
  const [paymentPayload, setPaymentPayload] = useState<null | iPayload>(null);
  const [searchParams] = useQueryStates({
    document: parseAsString.withDefault(""),
    b4f: parseAsString.withDefault(""),
    src: parseAsString.withDefault(""),
    sck: parseAsString.withDefault(""),
    utm_source: parseAsString.withDefault(""),
    utm_medium: parseAsString.withDefault(""),
    utm_campaign: parseAsString.withDefault(""),
    utm_term: parseAsString.withDefault(""),
    utm_content: parseAsString.withDefault(""),
  });

  const { firstStepFormData, secondStepFormData } = useOfferCheckoutSteps();
  const { visitorId: kondutoId } = useKonduto();
  const { offerData } = useOfferData();
  const { couponData } = useOfferCoupon();
  const { frenetShippingOptions, shippingPrice } = useOfferShipping();
  const {
    paymentSelected,
    orderBumps,
    planId,
    consumeTurnstileToken,
    set: setPayment,
  } = useOfferPayment();

  const form = useForm<formBankSlipType>({
    mode: "onChange",
    resolver: zodResolver(FormBankSlipValidation),
    defaultValues: {
      document: searchParams.document,
    },
  });

  const onSubmit = async (data: formBankSlipType) => {
    if (!firstStepFormData) return;
    const turnstileToken = consumeTurnstileToken();
    if (!turnstileToken) return;

    const id = await getFingerprint();

    const visitorId = `${id}-${kondutoId}`;
    const sessionID = uuid()?.replace(/-/g, "").substring(0, 21);

    const payload: iPayload = {
      ...firstStepFormData,
      cards: [],
      whatsapp: firstStepFormData.whatsapp.replace(/[^0-9]/g, ""),
      document_number: data.document.replace(/[^0-9]/g, ""),
      offer_id: offerData!.uuid,
      order_bumps: orderBumps,
      coupon: couponData?.coupon ?? null,
      b4f: Boolean(searchParams.b4f) ? searchParams.b4f : null,
      type: offerData!.payment.type,
      token: turnstileToken,
      payment_method: "billet",
      integration_shipping_company: null,
      integration_shipping_price: null,
      plan_id: planId,
      visitorId,
      sessionID,
      params: {},
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

  useImperativeHandle(ref, () => ({
    execute: form.handleSubmit(onSubmit),
  }));

  function onSuccess() {
    setPayment({ isBankSlipGenerate: true });
  }

  function onClose() {
    setPaymentPayload(null);
    setPayment({
      isPaying: false,
      isPaid: false,
      isBankSlipGenerate: false,
    });
  }

  function onError() {
    setPaymentPayload(null);
    setPayment({
      isPaying: false,
      isBankSlipGenerate: false,
    });
  }

  useEffect(() => {
    if (!form.formState.isSubmitted) return;
    formErrorStorage.setState({
      isFormError: Object.keys(form.formState.errors).length > 0,
    });
  }, [form.formState.isSubmitted]);

  if (!offerData) return <></>;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3",
        !offerData?.payment.methods.includes("billet") && "hidden",
      )}
      onClick={() => {
        form.clearErrors();
        setPayment({ paymentSelected: "BANK_SLIP" });
      }}
    >
      <div className="w-full">
        <div className="flex w-full items-center space-x-2.5 rounded-md bg-[#f9f9f9] p-3">
          <input type="radio" checked={paymentSelected === "BANK_SLIP"} />
          <div className="flex gap-1.5">
            <AiOutlineBarcode size={22} color="#636363" />
            <Label htmlFor="payment-method-bank-slip">Boleto</Label>
          </div>
        </div>
      </div>
      {paymentSelected === "BANK_SLIP" && (
        <FormProvider {...form}>
          <DocumentField />
        </FormProvider>
      )}
      <BankSlipPaymenProcess
        paymentInformations={paymentPayload}
        startPayment={Boolean(paymentPayload)}
        onSucess={onSuccess}
        onError={onError}
        onClose={onClose}
      />
    </div>
  );
});

const DocumentField = () => {
  const [_, setSearchParams] = useQueryStates(
    {
      document: parseAsString.withDefault(""),
    },
    {
      clearOnDefault: true,
    },
  );

  const form = useFormContext<formBankSlipType>();

  return (
    <CustomInput
      id="field-document"
      label="CPF do Titular"
      name="document"
      placeholder="Para emissão de nota fiscal"
      control={form.control}
      formater={FormaterCpf}
      onBlur={() => form.trigger("document")}
      onValueChange={(e) =>
        setSearchParams({
          document: e.target.value.replace(/[^\d]/g, ""),
        })
      }
    />
  );
};
