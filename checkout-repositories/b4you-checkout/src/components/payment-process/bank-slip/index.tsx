import { parseAsString, useQueryStates } from "nuqs";
import { ReactNode, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { fecthMutation } from "@/utils/fetch";
import { usePaymentEvents } from "@/hooks/integrations/pixel-events/usePaymentOffer";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { ContractDataType } from "@/shared/pixels/pixel-base-actions";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import {
  BankSlipDataType,
  paymentBankSlipDataType,
  PaymentStageType,
} from "./interface";
import { ModalBankSlipGenerating } from "./modal-bank-slip-generating";
import { ModalBankSlipInformation } from "./modal-bank-slip-information";

interface iBankSlipPaymenProcess {
  paymentInformations: paymentBankSlipDataType | null;
  startPayment: boolean;
  onClose?: VoidFunction;
  onSucess?: VoidFunction;
  onError?: VoidFunction;
}

export function BankSlipPaymenProcess(props: iBankSlipPaymenProcess) {
  const [bankSlipData, setBankSlipData] = useState<null | BankSlipDataType>(
    null,
  );
  const [paymentStage, setPaymentStage] = useState<PaymentStageType | null>(
    "peading",
  );

  const [searchParams] = useQueryStates({
    src: parseAsString.withDefault(""),
    sck: parseAsString.withDefault(""),
    utm_source: parseAsString.withDefault(""),
    utm_medium: parseAsString.withDefault(""),
    utm_campaign: parseAsString.withDefault(""),
    utm_content: parseAsString.withDefault(""),
    utm_term: parseAsString.withDefault(""),
  });

  const { paymentInformations, startPayment, onClose, onError, onSucess } =
    props;

  const { offerData } = useOfferData();
  const { offerPrice } = useOfferPayment();
  const { couponData } = useOfferCoupon();
  const { shippingPrice, shippingFree } = useOfferShipping();
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

  const { mutate, isPending } = fecthMutation<BankSlipDataType>({
    method: "post",
    route: `/payment/bank-slip?${paramsUrl.toString()}`,
    options: {
      mutationKey: ["bank-slip-info", JSON.stringify(paymentInformations)],
      onSuccess(data) {
        if (!offerData) return;

        setBankSlipData(data);
        setPaymentStage("created-code");

        const eventId = uuid();

        const dataEvent: ContractDataType = {
          eventId,
          saleId: data.sale_id,
          shippingPrice:
            shippingFree || shippingPrice === 0
              ? 0
              : shippingPrice ?? 0,
          paymentData: {
            couponName: couponData?.coupon,
            value: offerPrice ?? 0,
          },
          offerInformations: {
            uuid: offerData.uuid,
            name: offerData.offer.alternative_name ?? offerData.offer.name,
          },
        };

        usePaymentEvents({
          offerData,
          paymentSelect: "BANK_SLIP",
        }).onGenerate(dataEvent);

        usePaymentEvents({
          offerData,
          paymentSelect: "BANK_SLIP",
        }).uponCompleted(dataEvent);

        trackEvent("checkout_conversion_success", {
          step: "payment",
          paymentMethod: "boleto",
        });

        onSucess && onSucess();
      },
      onError() {
        setPaymentStage(null);
        setBankSlipData(null);
        onError && onError();
        trackEvent("checkout_payment_error", {
          step: "payment",
          paymentMethod: "boleto",
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


  const modalsProcess: { [key in PaymentStageType]: ReactNode } = {
    "created-code": (
      <ModalBankSlipInformation
        paymentStage={paymentStage!}
        bankSlipData={bankSlipData!}
        onClose={() => {
          onClose && onClose();
          setPaymentStage(null);
          setBankSlipData(null);
        }}
      />
    ),
    peading: <ModalBankSlipGenerating paymentStage={paymentStage} />,
    "error-server": undefined,
    "error-information": undefined,
  };

  return paymentStage ? modalsProcess[paymentStage] : <></>;
}
