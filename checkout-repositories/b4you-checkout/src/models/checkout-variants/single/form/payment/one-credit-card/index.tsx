import { zodResolver } from "@hookform/resolvers/zod";
import { useIsFetching } from "@tanstack/react-query";
import { motion } from "motion/react";
import { parseAsString, useQueryStates } from "nuqs";
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
import { useKonduto } from "@/hooks/states/useKonduto";
import { useOfferData } from "@/hooks/states/useOfferData";
import { CardFormater } from "@/shared/formaters";
import { cn } from "@/shared/libs/cn";
import { getFingerprint } from "@/shared/visitor-id";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { useCheckoutStorage } from "../../storage";
import { FormCreditCardValidation } from "./_schema";
import { Card } from "./card";
import "react-credit-cards-2/dist/es/styles-compiled.css";

export type CardInfoType = z.infer<typeof FormCreditCardValidation>;

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

export const SingleCreditCard = forwardRef<{
  execute: () => void;
}>((_, ref) => {
  const [isPixPayment, setPixPayment] = useState<boolean>(false);
  const [pixRequested, setPixRequested] = useState(false);
  const [paymentPayload, setPaymentPayload] = useState<null | iPayload>(null);
  const [cardData, setCardData] = useState<null | CardInfoType>(null);
  const [fieldName, setFieldName] = useState<keyof CardInfoType>("cardNumber");
  const [searchParams] = useQueryStates({
    b4f: parseAsString.withDefault(""),
    src: parseAsString.withDefault(""),
    sck: parseAsString.withDefault(""),
    utm_campaign: parseAsString.withDefault(""),
    utm_content: parseAsString.withDefault(""),
    utm_source: parseAsString.withDefault(""),
    utm_medium: parseAsString.withDefault(""),
    utm_term: parseAsString.withDefault(""),
  });

  const { offerData } = useOfferData();
  const { couponData } = useOfferCoupon();
  const { visitorId: kondutoId } = useKonduto();
  const { frenetShippingOptions, shippingPrice } = useOfferShipping();
  const {
    planId,
    orderBumps,
    set: setPayment,
    startCaptcha,
    getValidTurnstileToken,
    consumeTurnstileToken,
    isTurnstileTokenValid,
  } = useOfferPayment();
  const { userInfo, addressInfo, addressInfoError, userInfoError } =
    useCheckoutStorage();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });
  const pendingSubmitRef = useRef<null | (() => void)>(null);
  const lastSubmitCountRef = useRef(0);

  const form = useForm<CardInfoType>({
    mode: "onChange",
    resolver: zodResolver(FormCreditCardValidation),
  });

  const onSubmit = (data: CardInfoType) => {
    setCardData(data);
  };

  useImperativeHandle(ref, () => ({
    execute: form.handleSubmit(onSubmit),
  }));

  const { installmentOptions, installmentSelectedValue, set } =
    useOfferPayment();

  const isFetching = Boolean(useIsFetching());

  function handleInstallmentSelect(value: string) {
    set({ installmentSelectedValue: Number(value) });
  }

  function payloadFormatterPix(): paymentPixDataType | null {
    if (!paymentPayload) return null;

    return {
      ...paymentPayload,
      payment_method: "pix",
    };
  }

  function onReview() {
    setPaymentPayload(null);
    form.setFocus("cardHolderName");
  }

  function onAddNewCard() {
    setPaymentPayload(null);
    form.setFocus("cardHolderName");
    form.reset();
  }

  useEffect(() => {
    if (!userInfo) return;
    if (userInfoError || !cardData) return;
    if (offerData?.require_address && addressInfoError) return;

    const sendPayloadPayment = async () => {
      const turnstileToken = consumeTurnstileToken();
      if (!turnstileToken) return;

      const id = await getFingerprint();

      const visitorId = `${id}-${kondutoId}`;
      const sessionID = uuid()?.replace(/-/g, "").substring(0, 21);

      const findInstallment = installmentOptions?.find(
        (option) => option.value === String(installmentSelectedValue),
      );

      const payload: iPayload = {
        ...userInfo,
        whatsapp: userInfo.whatsapp.replace(/[^0-9]/g, ""),
        document_number: userInfo?.document_number.replace(/[^0-9]/g, ""),
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
            card_number: cardData.cardNumber?.replace(/[^0-9]/g, ""),
            card_holder: cardData.cardHolderName,
            expiration_date: cardData.cardValidate,
            cvv: cardData.secreteCardNumber?.replace(/[^0-9]/g, ""),
            document_number: userInfo?.document_number?.replace(/[^0-9]/g, ""),
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

      if (offerData?.require_address && addressInfo) {
        payload.address = {
          ...addressInfo,
          number: addressInfo.number_address,
        } as paymentCreditCardDataType["address"];
      }

      setPaymentPayload(payload);
    };

    sendPayloadPayment();
  }, [cardData, userInfoError, addressInfoError]);

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

  async function buildPixPayload(): Promise<iPayload | null> {
    if (!userInfo || !cardData || !offerData) return null;
    if (offerData.require_address && !addressInfo) return null;

    const turnstileToken = consumeTurnstileToken();
    if (!turnstileToken) return null;

    const id = await getFingerprint();
    const visitorId = `${id}-${kondutoId}`;
    const sessionID = uuid()?.replace(/-/g, "").substring(0, 21);

    const findInstallment = installmentOptions?.find(
      (option) => option.value === String(installmentSelectedValue),
    );

    const payload: iPayload = {
      ...userInfo,
      whatsapp: userInfo.whatsapp.replace(/[^0-9]/g, ""),
      document_number: userInfo.document_number.replace(/[^0-9]/g, ""),
      offer_id: offerData.uuid,
      order_bumps: orderBumps,
      coupon: couponData?.coupon ?? null,
      b4f: Boolean(searchParams.b4f) ? searchParams.b4f : null,
      type: offerData.payment.type,
      token: String(turnstileToken),
      payment_method: "pix",
      integration_shipping_company: null,
      integration_shipping_price: null,
      plan_id: planId,
      visitorId,
      sessionID,
      params: {},
      cards: [
        {
          card_number: cardData.cardNumber.replace(/[^0-9]/g, ""),
          card_holder: cardData.cardHolderName,
          expiration_date: cardData.cardValidate,
          cvv: cardData.secreteCardNumber.replace(/[^0-9]/g, ""),
          document_number: userInfo.document_number.replace(/[^0-9]/g, ""),
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

    if (offerData.has_frenet) {
      const frenetSelect = frenetShippingOptions.find(
        (option) => option.price === shippingPrice,
      );
      payload.integration_shipping_company = frenetSelect?.company ?? null;
      payload.integration_shipping_price = frenetSelect?.price ?? null;
    }

    if (offerData.require_address && addressInfo) {
      payload.address = {
        ...addressInfo,
        number: addressInfo.number_address,
      } as paymentCreditCardDataType["address"];
    }

    return payload;
  }

  useEffect(() => {
    if (!pendingSubmitRef.current) return;
    if (!getValidTurnstileToken()) return;

    const submit = pendingSubmitRef.current;
    pendingSubmitRef.current = null;

    submit();
  }, [getValidTurnstileToken]);

  useEffect(() => {
    if (!paymentPayload || !pixRequested) return;

    setPixPayment(true);
    setPixRequested(false);
  }, [paymentPayload, pixRequested]);

  return (
    <>
      <FormProvider {...form}>
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <div className="flex flex-col items-start gap-1.5 border-r-2 pr-4 max-[1000px]:w-full max-[1000px]:border-0 max-[1000px]:p-0">
            <CustomInput
              id="field-card-number"
              className="h-[38px] w-[100%] rounded-[4px] pl-10"
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
                className="h-[38px] w-full rounded-[4px] pl-10"
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
                className="h-[38px] w-full rounded-[4px] pl-10"
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
              className="h-[38px] w-[100%] rounded-[4px] pl-10"
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
                value={String(installmentSelectedValue)}
                placeholder="Selecionar parcelamento"
                data={installmentOptions ?? []}
                disabled={isFetching}
                onValueChange={handleInstallmentSelect}
              />
            </div>
          </div>
          <div className={cn("max-w-[300px] pl-4 max-[900px]:hidden")}>
            <Card focusField={fieldName} />
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
            setPixRequested(true);

            pendingSubmitRef.current = async () => {
              const payload = await buildPixPayload();
              if (!payload) {
                setPixRequested(false);
                return;
              }

              setPaymentPayload(payload);
              setPixPayment(true);
              setPixRequested(false);
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
});
