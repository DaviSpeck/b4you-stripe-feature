import { motion } from "motion/react";
import { parseAsString, useQueryStates } from "nuqs";
import { forwardRef, useImperativeHandle, useState } from "react";
import { v4 as uuid } from "uuid";
import { BankSlipPaymenProcess } from "@/components/payment-process/bank-slip";
import { paymentCreditCardDataType } from "@/components/payment-process/credit-card/interface";
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

export const BankSlipPaymentInformation = forwardRef<{
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

  function onSuccess() {
    setPayment({ isBankSlipGenerate: true });
  }

  function onClose() {
    setPaymentPayload(null);
    useCheckoutStorage.setState({
      userInfoError: true,
      addressInfoError: true,
    });
    setPayment({
      isPaying: false,
      isPaid: false,
      isBankSlipGenerate: false,
    });
  }

  function onError() {
    setPaymentPayload(null);
    useCheckoutStorage.setState({
      userInfoError: true,
      addressInfoError: true,
    });
    setPayment({ isBankSlipGenerate: false });
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

  const shouldStartBillet = Boolean(paymentPayload);

  return (
    <>
      <motion.div
        className="flex flex-col gap-5"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
      >
        <h2 className="text-[1.25rem] font-semibold">
          Atente-se aos detalhes do boleto bancário:
        </h2>
        <ul className="flex list-inside list-disc flex-col gap-2 pl-2">
          <li className="text-[1rem]">
            Boleto somente à vista:{" "}
            <span className="font-semibold">
              {" "}
              {cashPayment.toLocaleString("pt-br", {
                currency: "BRL",
                style: "currency",
              })}
            </span>
            .
          </li>
          <li className="text-[1rem]">
            Pagamentos com Boleto Bancário levam até 3 dias úteis para serem
            compensados e então terem os produtos liberados.
          </li>
          <li className="text-[1rem]">
            Atente-se ao vencimento do boleto. Você pode pagar o boleto em
            qualquer banco ou casa lotérica até o dia do vencimento.
          </li>
          <li className="text-[1rem]">
            Depois do pagamento, verifique seu e-mail para receber os dados de
            acesso ao produto (verifique também a caixa de SPAM).
          </li>
        </ul>
      </motion.div>
      <BankSlipPaymenProcess
        paymentInformations={paymentPayload}
        startPayment={shouldStartBillet}
        onSucess={onSuccess}
        onError={onError}
        onClose={onClose}
      />
    </>
  );
})
