import { motion } from "motion/react";
import { parseAsString, useQueryStates } from "nuqs";
import { forwardRef, useImperativeHandle, useState } from "react";
import { v4 as uuid } from "uuid";
import { paymentCreditCardDataType } from "@/components/payment-process/credit-card/interface";
import { PixPaymentProcess } from "@/components/payment-process/pix";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useKonduto } from "@/hooks/states/useKonduto";
import { useOfferData } from "@/hooks/states/useOfferData";
import { getFingerprint } from "@/shared/visitor-id";
import { useCheckoutStorage } from "../storage";

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

export const PixPaymentInformation = forwardRef<{
  execute: () => void;
}>((_, ref) => {
  const [paymentPayload, setPaymentPayload] = useState<null | iPayload>(null);
  const [searchParams] = useQueryStates({
    b4f: parseAsString.withDefault(""),
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
  const { offerPriceWithDiscount, couponData } = useOfferCoupon();
  const {
    offerPrice,
    orderBumps,
    planId,
    consumeTurnstileToken,
    set: setPayment,
  } = useOfferPayment();
  const { frenetShippingOptions, shippingPrice } = useOfferShipping();
  const { userInfo, addressInfo, addressInfoError } =
    useCheckoutStorage();

  const cashPayment = offerPriceWithDiscount ?? offerPrice ?? 0;

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
    useCheckoutStorage.setState({
      userInfoError: true,
      addressInfoError: true,
    });
  }

  async function sendPayloadPayment() {
    if (!userInfo) return;
    if (offerData?.require_address && addressInfoError) return;

    const turnstileToken = consumeTurnstileToken();
    if (!turnstileToken) return;

    const id = await getFingerprint();
    const visitorId = `${id}-${kondutoId}`;
    const sessionID = uuid().replace(/-/g, "").substring(0, 21);

    const payload: iPayload = {
      ...userInfo,
      cards: [],
      whatsapp: userInfo.whatsapp.replace(/[^0-9]/g, ""),
      document_number: userInfo.document_number.replace(/[^0-9]/g, ""),
      offer_id: offerData!.uuid,
      order_bumps: orderBumps,
      coupon: couponData?.coupon ?? null,
      b4f: searchParams.b4f || null,
      type: offerData!.payment.type,
      token: String(turnstileToken),
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
      if (value) payload.params[key as keyof typeof payload.params] = value;
    });

    if (offerData?.has_frenet) {
      const frenetSelect = frenetShippingOptions.find(
        (option) => option.price === shippingPrice
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
  }

  useImperativeHandle(ref, () => ({
    execute: async () => {
      await sendPayloadPayment();
    },
  }));

  const shouldStartPix = Boolean(paymentPayload);

  return (
    <>
      <motion.div
        className="flex min-w-full flex-col gap-5"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
      >
        <h2 className="w-full text-[1.25rem] font-semibold">
          Pague com o Pix, qualquer dia, a qualquer hora:
        </h2>
        <ul className="flex w-full list-inside list-disc flex-col pl-2 text-[1rem] wrap-break-word whitespace-normal">
          <li className="text-[1rem]">Pix somente à vista.</li>
          <li className="text-[1rem]">Liberação imediata!</li>
          <li className="text-[1rem]">
            É simples, só clicar no botão{" "}
            <span className="font-semibold">{"Comprar Agora"}</span> abaixo;
          </li>
          <li className="text-[1rem]">
            E usar o aplicativo do seu banco selecionando a opção PIX;
          </li>
          <li className="text-[1rem]">
            Super seguro. O pagamento PIX foi desenvolvido pelo Banco Central do
            Brasil.
          </li>
          <li>
            Valor no Pix:{" "}
            <span className="font-semibold">
              {" "}
              {cashPayment.toLocaleString("pt-br", {
                currency: "BRL",
                style: "currency",
              })}
            </span>
          </li>
        </ul>
      </motion.div>
      <PixPaymentProcess
        startPayment={shouldStartPix}
        offerUuid={offerData?.uuid ?? ""}
        paymentInformations={paymentPayload}
        shippingPrice={shippingPrice ?? 0}
        onSucess={onSucess}
        onReview={onReview}
      />
    </>
  );
})
