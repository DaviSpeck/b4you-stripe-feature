import { parseAsString, useQueryStates } from "nuqs";
import { memo, ReactNode, useEffect, useRef, useState } from "react";
import { fecthMutation } from "@/utils/fetch";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { usePixelStates } from "@/hooks/states/usePixel";
import { SaleContext } from "@/interfaces/sale-context";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { paymentCreditCardDataType, paymentStageType } from "./interface";
import { ModalPaymentSucess } from "./modal-paymen-sucess";
import { ModalPaymentDenied } from "./modal-payment-denied";
import { ModalPaymentProcessing } from "./modal-payment-processing";

interface iProps {
  paymentInformations: paymentCreditCardDataType | null;
  startPayment: boolean;
  onAddNewCard?: VoidFunction;
  onReview?: VoidFunction;
  onSucess?: VoidFunction;
  onRequestPix?: () => void;
}

type CreditCardResponse = {
  sale_id: string;
  upsell_url: string | null;
  cartao_status_details: string;
  status: {
    id: number;
    code: string;
    color: string;
    key: string;
    name: string;
  };
};

export const CreditCardPaymentProcess = memo((props: iProps) => {
  const [searchParams] = useQueryStates({
    src: parseAsString.withDefault(""),
    sck: parseAsString.withDefault(""),
    utm_source: parseAsString.withDefault(""),
    utm_medium: parseAsString.withDefault(""),
    utm_campaign: parseAsString.withDefault(""),
    utm_content: parseAsString.withDefault(""),
    utm_term: parseAsString.withDefault(""),
  });

  const [saleContext, setSaleContext] = useState<SaleContext | null>(null);
  const [errorCode, setErroCode] = useState<string | null>(null);
  const [paymentStage, setPaymentStage] = useState<paymentStageType | null>(
    null,
  );

  const {
    paymentInformations,
    startPayment,
    onReview,
    onSucess,
    onAddNewCard,
    onRequestPix
  } = props;

  const { set: setOfferPayment } = useOfferPayment();
  const { offerData } = useOfferData();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  const paramsUrl = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Boolean(value)) {
      paramsUrl.set(key, value);
    }
  });

  const { set } = usePixelStates();

  const { mutate, isPending } = fecthMutation<CreditCardResponse>({
    method: "post",
    route: `/payment/credit-card?${paramsUrl.toString()}`,
    options: {
      mutationKey: ["credit-card-payment", JSON.stringify(paymentInformations)],
      onSuccess: (data) => {
        if (data.status.key === "denied") {
          setPaymentStage("denied");
          set({ isPaid: false, isPaymentInformations: true });
          setErroCode(String(data.status.code));
          trackEvent("checkout_payment_error", {
            step: "payment",
            paymentMethod: "credit_card",
          });
          setOfferPayment({ isPaying: false });
          return;
        }

        if (data.status.key === "paid") {
          if (!offerData?.uuid) {
            setPaymentStage("error_server");
            setOfferPayment({ isPaying: false });
            return;
          }
          setSaleContext({
            saleId: data.sale_id,
            upsellUrl: data.upsell_url,
            isNativeUpsell: Boolean(offerData.offer_upsell_native),
            offerId: offerData.uuid,
          });
          setPaymentStage("sucess");
          set({
            isPaid: true,
            isPaymentInformations: true,
            saleId: data.sale_id,
          });
          trackEvent("checkout_payment_success", {
            step: "payment",
            paymentMethod: "credit_card",
          });
          trackEvent("checkout_conversion_success", {
            step: "payment",
            paymentMethod: "credit_card",
          });
          onSucess && onSucess();
        }
      },
      onError: () => {
        setPaymentStage("denied");
        trackEvent("checkout_payment_error", {
          step: "payment",
          paymentMethod: "credit_card",
        });
        setOfferPayment({ isPaying: false });
      },
    },
  });

  const modalsProcess: { [key in paymentStageType]: ReactNode } = {
    peading: <ModalPaymentProcessing paymentStage={paymentStage} />,
    sucess: (
      <ModalPaymentSucess
        saleContext={saleContext}
        paymentStage={paymentStage}
        paymentInformations={props.paymentInformations}
      />
    ),
    denied: (
      <ModalPaymentDenied
        paymentStage={paymentStage}
        onReview={onReview}
        errorCode={errorCode}
        onPixGenerate={onRequestPix}
        onAddNewCard={() => {
          onAddNewCard && onAddNewCard();
          onReview && onReview();
        }}
      />
    ),
    error_server: <></>,
  };

  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!paymentInformations || !startPayment) {
      hasSubmittedRef.current = false;
      setPaymentStage(null);
      return;
    }

    if (isPending || hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;
    mutate(paymentInformations);
  }, [paymentInformations, startPayment]);

  useEffect(() => {
    if (paymentInformations && startPayment) {
      setPaymentStage("peading");
    }
  }, [paymentInformations, startPayment]);

  return paymentStage ? modalsProcess[paymentStage] : <></>;
});
