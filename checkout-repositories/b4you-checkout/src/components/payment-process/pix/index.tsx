import { useRouter } from "next/router";
import { parseAsString, useQueryStates } from "nuqs";
import { memo, ReactNode, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { fecthMutation } from "@/utils/fetch";
import { usePaymentEvents } from "@/hooks/integrations/pixel-events/usePaymentOffer";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { usePixelStates } from "@/hooks/states/usePixel";
import { paymentPixResponse } from "@/pages/api/payment/pix";
import { ContractDataType } from "@/shared/pixels/pixel-base-actions";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { paymentPixDataType, paymentStageType } from "./interface";
import { ModalPixPaymentSucess } from "./modal-paymen-sucess";
import { ModalPixGeneratingProcessing } from "./modal-pix-generating";
import { ModalPixInformation } from "./modal-pix-information";

interface iPixPaymentProcess {
  paymentInformations: paymentPixDataType | null;
  startPayment: boolean;
  shippingPrice: number;
  onReview?: VoidFunction;
  onSucess?: VoidFunction;
  offerUuid: string;
}

export const PixPaymentProcess = memo((props: iPixPaymentProcess) => {
  const [searchParams] = useQueryStates({
    src: parseAsString.withDefault(""),
    sck: parseAsString.withDefault(""),
    utm_source: parseAsString.withDefault(""),
    utm_medium: parseAsString.withDefault(""),
    utm_campaign: parseAsString.withDefault(""),
    utm_content: parseAsString.withDefault(""),
    utm_term: parseAsString.withDefault(""),
  });

  const [pixData, setPixData] = useState<paymentPixResponse | null>(null);
  const [paymentStage, setPaymentStage] =
    useState<paymentStageType | null>(null);

  const { paymentInformations, startPayment, onReview, onSucess, offerUuid } =
    props;

  const { offerPrice } = useOfferPayment();
  const { shippingPrice, shippingFree } = useOfferShipping();
  const { couponData } = useOfferCoupon();
  const { offerData } = useOfferData();
  const { set } = usePixelStates();
  const { set: setOfferPayment } = useOfferPayment();

  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  const router = useRouter();

  const paramsUrl = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Boolean(value)) {
      paramsUrl.set(key, value);
    }
  });

  const { mutate, isPending } = fecthMutation<paymentPixResponse>({
    method: "post",
    route: `/payment/pix/payment-information?${paramsUrl.toString()}`,
    options: {
      mutationKey: ["pix-info", JSON.stringify(paymentInformations)],
      onSuccess(data) {
        if (!offerData) return;

        setPixData(data);
        setPaymentStage("information");
        set({ isPixGenerated: true, saleId: data.sale_id });

        const eventId = uuid();
        const dataEvent: ContractDataType = {
          eventId,
          saleId: data.sale_id,
          shippingPrice: shippingFree ? 0 : (shippingPrice ?? 0),
          paymentData: {
            couponName: couponData?.coupon,
            value: offerPrice ?? 0,
          },
          offerInformations: {
            uuid: offerData.uuid,
            name:
              offerData.offer.alternative_name ??
              offerData.offer.name,
          },
        };

        usePaymentEvents({
          offerData,
          paymentSelect: "PIX",
        }).onGenerate(dataEvent);

        usePaymentEvents({
          offerData,
          paymentSelect: "PIX",
        }).uponCompleted(dataEvent);

        onSucess && onSucess();
      },
      onError() {
        setOfferPayment({
          isPaying: false,
          isPaid: false,
          paymentSelected: "PIX",
        });
        setPaymentStage(null);
        setPixData(null);
        onReview?.();
        trackEvent("checkout_payment_error", {
          step: "payment",
          paymentMethod: "pix",
        });
      },
    },
  });

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

  // Se quiser usar o modal em vez da página, é só comentar este código
  useEffect(() => {
    if (paymentStage !== "information" || !pixData) return;
    trackEvent("checkout_conversion_success", {
      step: "payment",
      paymentMethod: "pix",
    });
    setTimeout(() => {
      router
        .push({
          pathname: "/pix",
          query: {
            sale_id: pixData.sale_id,
            offerUuid: offerUuid,
          },
        })
        .then(() => router.reload());
    }, 300);
  }, [paymentStage, pixData]);

  const modalsProcess: { [key in paymentStageType]: ReactNode } = {
    sucess: (
      <ModalPixPaymentSucess
        paymentStage={paymentStage}
        saleId={pixData?.sale_id ?? null}
        paymentInformations={props.paymentInformations}
      />
    ),
    peading: <ModalPixGeneratingProcessing paymentStage={paymentStage} />,
    error_server: <></>,
    information: (
      <ModalPixInformation
        paymentStage={paymentStage}
        pixData={pixData}
        onClose={onReview}
      />
    ),
  };

  if (paymentStage === "information") return <></>;
  // ===================================================================== //

  return paymentStage ? modalsProcess[paymentStage] : <></>;
});
