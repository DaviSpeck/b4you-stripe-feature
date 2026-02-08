import { zodResolver } from "@hookform/resolvers/zod";
import { parseAsString, useQueryStates } from "nuqs";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { MdOutlinePix } from "react-icons/md";
import { v4 as uuid } from "uuid";
import z from "zod";
import { CustomInput } from "@/components/custom-inputs-form";
import { paymentCreditCardDataType } from "@/components/payment-process/credit-card/interface";
import { PixPaymentProcess } from "@/components/payment-process/pix";
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
import { FormPixValidation } from "./_schema";

type formPixType = z.infer<typeof FormPixValidation>;

interface iPayload extends Omit<paymentCreditCardDataType, "address"> {
  address?: paymentCreditCardDataType["address"];
  plan_id: string | null;
  payment_method: "pix";
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

export const FormPixdInformations = forwardRef((_, ref) => {
  const [paymentPayload, setPaymentPayload] = useState<null | iPayload>(null);
  const [searchParams] = useQueryStates({
    b4f: parseAsString.withDefault(""),
    document: parseAsString.withDefault(""),
    src: parseAsString.withDefault(""),
    sck: parseAsString.withDefault(""),
    utm_source: parseAsString.withDefault(""),
    utm_medium: parseAsString.withDefault(""),
    utm_campaign: parseAsString.withDefault(""),
    utm_term: parseAsString.withDefault(""),
    utm_content: parseAsString.withDefault(""),
  });

  const { offerData } = useOfferData();
  const { visitorId: kondutoId } = useKonduto();
  const { couponData } = useOfferCoupon();
  const { firstStepFormData, secondStepFormData } = useOfferCheckoutSteps();
  const { frenetShippingOptions, shippingPrice } = useOfferShipping();
  const {
    paymentSelected,
    orderBumps,
    planId,
    consumeTurnstileToken,
    set: setPayment,
  } = useOfferPayment();

  const form = useForm<formPixType>({
    mode: "onChange",
    resolver: zodResolver(FormPixValidation),
    defaultValues: {
      document: searchParams.document,
    },
  });

  function onSucess() {
    setPayment({
      isPaying: false,
      isPixGenerate: true,
      isPaid: false,
    });
  }

  function onReview() {
    setPaymentPayload(null);
    setPayment({ isPaying: false });
  }

  const onSubmit = async (data: formPixType) => {
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
      payment_method: "pix",
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

  useEffect(() => {
    if (!form.formState.isSubmitted) return;
    formErrorStorage.setState({
      isFormError: Object.keys(form.formState.errors).length > 0,
    });
  }, [form.formState.isSubmitted]);

  if (!offerData) return;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3",
        !offerData.payment.methods.includes("pix") && "hidden",
      )}
      {...(paymentSelected !== "PIX" && {
        onClick: () => {
          form.clearErrors();
          setPayment({ paymentSelected: "PIX" });
        },
      })}
    >
      <div defaultValue="CARD" className="w-full">
        <div className="flex w-full items-center space-x-2.5 rounded-md bg-[#f9f9f9] p-3">
          <input type="radio" checked={paymentSelected === "PIX"} />
          <div className="flex gap-1.5">
            <MdOutlinePix size={22} color="#636363" />
            <Label htmlFor="payment-method-pix">Pix</Label>
          </div>
        </div>
      </div>
      {paymentSelected === "PIX" && (
        <FormProvider {...form}>
          <DocumentField />
        </FormProvider>
      )}
      <PixPaymentProcess
        startPayment={Boolean(paymentPayload)}
        offerUuid={offerData?.uuid ?? ""}
        paymentInformations={paymentPayload}
        shippingPrice={shippingPrice ?? 0}
        onSucess={onSucess}
        onReview={onReview}
      />
    </div>
  );
});

const DocumentField = () => {
  const [_, setSearchParams] = useQueryStates({
    document: parseAsString.withDefault(""),
  });

  const form = useFormContext<formPixType>();

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
