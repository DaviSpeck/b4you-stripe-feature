import { AnimatePresence } from "motion/react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { PaymentTypes } from "@/interfaces/offer";
import { cn } from "@/shared/libs/cn";
import { toPaymentMethod } from "@/tracking/eventTypes";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { BankSlipPaymentInformation } from "./bank-slip";
import { BtnOptions } from "./btn-options";
import { SingleCreditCard } from "./one-credit-card";
import { PixPaymentInformation } from "./pix";
import { TwoCardsPayment } from "./two-credit-card";

export const PaymentMethods = forwardRef<{
  execute: () => void;
}>((_, ref) => {
  const [typeSelected, setTypeSelected] = useState<PaymentTypes>("CARD");

  const { getOfferPrice } = useOfferData();
  const { set } = useOfferPayment();
  const { offerData } = useOfferData();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  useEffect(() => {
    const { price } = getOfferPrice(typeSelected);
    set({ paymentSelected: typeSelected, offerPrice: price });
  }, [typeSelected]);

  useEffect(() => {
    cardRef.current = null;
    pixRef.current = null;
    billetRef.current = null;
    twoCardsRef.current = null;
  }, [typeSelected]);

  const lastPaymentMethodRef = useRef<PaymentTypes | null>(null);
  const cardRef = useRef<{ execute: () => void }>(null);
  const pixRef = useRef<{ execute: () => void }>(null);
  const billetRef = useRef<{ execute: () => void }>(null);
  const twoCardsRef = useRef<{ execute: () => void }>(null);

  useEffect(() => {
    if (lastPaymentMethodRef.current === typeSelected) return;
    lastPaymentMethodRef.current = typeSelected;
    trackEvent("checkout_payment_method_selected", {
      step: "payment",
      paymentMethod: toPaymentMethod(typeSelected),
    });
  }, [typeSelected, trackEvent]);

  useImperativeHandle(ref, () => ({
    execute: () => {
      switch (typeSelected) {
        case "CARD":
          cardRef.current?.execute();
          break;

        case "PIX":
          pixRef.current?.execute();
          break;

        case "BANK_SLIP":
          billetRef.current?.execute();
          break;

        case "TWO_CARDS":
          twoCardsRef.current?.execute();
          break;
      }
    },
  }));

  return (
    <>
      <div className="flex w-full flex-col gap-4 pt-4">
        <BtnOptions
          currentTypeSelected={typeSelected}
          onChange={(value) => {
            setTypeSelected(value);
          }}
        />
        <AnimatePresence initial={false}>
          <div
            className={cn(
              "w-full rounded-[8px] border p-4",
              typeSelected && typeSelected === "TWO_CARDS" && "border-none p-0",
            )}
          >
            {typeSelected === "CARD" && <SingleCreditCard ref={cardRef} />}
            {typeSelected === "TWO_CARDS" && (
              <TwoCardsPayment ref={twoCardsRef} />
            )}
            {typeSelected === "PIX" && (
              <PixPaymentInformation ref={pixRef} />
            )}
            {typeSelected === "BANK_SLIP" && (
              <BankSlipPaymentInformation ref={billetRef} />
            )}
          </div>
        </AnimatePresence>
      </div>
    </>
  );
});
