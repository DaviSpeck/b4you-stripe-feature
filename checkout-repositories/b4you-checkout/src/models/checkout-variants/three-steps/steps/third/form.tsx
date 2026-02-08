import { useIsMutating } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { toPaymentMethod } from "@/tracking/eventTypes";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { Button } from "@/components/ui/button";
import { FormBankSlipInformation } from "./form-options/bank-slip";
import { FormCardInformations } from "./form-options/one-card";
import { FormPixdInformations } from "./form-options/pix";
import { formErrorStorage } from "./form-options/storage";
// import { FormTwoCardInformations } from "./form-options/two-card";
import { OrderBumps } from "./order-bumps";

export function FormThirdStep() {
  const { isFormError } = formErrorStorage();
  const { offerData } = useOfferData();

  const {
    isPaying,
    paymentSelected,
    turnstileToken,
    needsCaptcha,
    startCaptcha,
    getValidTurnstileToken,
    isTurnstileTokenValid,
  } = useOfferPayment();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "3steps",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  const isFetching = Boolean(useIsMutating());

  if (!offerData) return <></>;

  const handleFormCardSubmitRef = useRef<{
    execute: () => void;
  }>(null);

  const handleFormTwoCardsSubmitRef = useRef<{
    execute: () => void;
  }>(null);

  const handleFormPixSubmitRef = useRef<{
    execute: () => void;
  }>(null);

  const handleFormBankSlipSubmitRef = useRef<{
    execute: () => void;
  }>(null);

  const lastPaymentMethodRef = useRef(paymentSelected);
  const lastErrorRef = useRef(false);

  useEffect(() => {
    if (!paymentSelected || paymentSelected === lastPaymentMethodRef.current) {
      return;
    }

    lastPaymentMethodRef.current = paymentSelected;

    trackEvent("checkout_payment_method_selected", {
      step: "payment",
      paymentMethod: toPaymentMethod(paymentSelected),
    });
  }, [paymentSelected, trackEvent]);

  useEffect(() => {
    if (isFormError === lastErrorRef.current) return;

    lastErrorRef.current = isFormError;

    if (isFormError) {
      trackEvent("checkout_payment_data_error", {
        step: "payment",
        paymentMethod: toPaymentMethod(paymentSelected),
      });
    }
  }, [isFormError, paymentSelected, trackEvent]);

  const pendingSubmitRef = useRef<(() => void) | null>(null);

  const executeSubmit = () => {
    switch (paymentSelected) {
      case "CARD":
        handleFormCardSubmitRef.current?.execute();
        break;
      case "TWO_CARDS":
        handleFormTwoCardsSubmitRef.current?.execute();
        break;
      case "BANK_SLIP":
        handleFormBankSlipSubmitRef.current?.execute();
        break;
      case "PIX":
        handleFormPixSubmitRef.current?.execute();
        break;
    }
  };

  useEffect(() => {
    if (!pendingSubmitRef.current) return;
    if (!getValidTurnstileToken()) return;

    pendingSubmitRef.current();
    pendingSubmitRef.current = null;
  }, [turnstileToken, getValidTurnstileToken]);

  return (
    <>
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-2">
          <FormCardInformations ref={handleFormCardSubmitRef} />
          {/* <FormTwoCardInformations ref={handleFormTwoCardsSubmitRef} /> */}
          <FormBankSlipInformation ref={handleFormBankSlipSubmitRef} />
          <FormPixdInformations ref={handleFormPixSubmitRef} />
        </div>

        {offerData.payment.type !== "subscription" && <OrderBumps />}
        <div className="flex flex-col">
          <Button
            id="third-step-btn-submit"
            className="cursor-pointer rounded-[10px] bg-[#36b90e] py-6 text-[1.12rem] font-normal hover:bg-[#2e9d0c] disabled:cursor-not-allowed"
            disabled={isFetching || isPaying || needsCaptcha}
            onClick={() => {
              trackEvent("checkout_submit_clicked", {
                step: "payment",
                paymentMethod: toPaymentMethod(paymentSelected),
              });

              trackEvent("checkout_payment_data_started", {
                step: "payment",
                paymentMethod: toPaymentMethod(paymentSelected),
              });

              if (!isTurnstileTokenValid()) {
                pendingSubmitRef.current = executeSubmit;
                startCaptcha();
                return;
              }

              executeSubmit();
            }}
          >
            Comprar agora
            {(isPaying || needsCaptcha) && (
              <AiOutlineLoading3Quarters size={30} className="animate-spin" />
            )}
          </Button>
          {isFormError && (
            <span className="py-1.5 text-center text-[0.75rem] text-red-500">
              Preencha todos os campos corretamente para finalizar a compra.
            </span>
          )}
        </div>
      </div>
    </>
  );
}
