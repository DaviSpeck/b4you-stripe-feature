import { useEffect } from "react";
import Cards, { Focused } from "react-credit-cards-2";
import "react-credit-cards-2/dist/es/styles-compiled.css";
import { useFormContext } from "react-hook-form";
import { v4 as uuid } from "uuid";
import { usePaymentInformationEvents } from "@/hooks/integrations/pixel-events/usePaymentInformation";
import { useOfferCoupon, useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { CardInfoType } from ".";

interface iProps {
  focusField: keyof CardInfoType;
}

export function Card(props: iProps) {
  const { focusField } = props;

  const { offerData } = useOfferData();
  const { offerPrice } = useOfferPayment();
  const { couponData } = useOfferCoupon();

  const form = useFormContext<CardInfoType>();

  const dicionary: Record<keyof CardInfoType, Focused> = {
    cardNumber: "number",
    cardValidate: "expiry",
    secreteCardNumber: "cvc",
    cardHolderName: "name",
  };

  form.watch();

  useEffect(() => {
    if (!offerData) return;

    const values = {
      cardHolderName: form.getValues("cardHolderName"),
      cardNumber: form.getFieldState("cardNumber"),
      cardValidate: form.getValues("cardValidate"),
      secreteCardNumber: form.getValues("secreteCardNumber"),
    };

    const isAnyValueFalse = Object.values(values)
      .map((value) => Boolean(value))
      .includes(false);

    if (isAnyValueFalse) return;

    const eventId = uuid();

    usePaymentInformationEvents(offerData).handler({
      eventId,
      offerInformations: {
        uuid: offerData.uuid,
        name: offerData.offer.alternative_name ?? offerData.offer.name,
      },
      paymentData: {
        value: offerPrice ?? 0,
        couponName: couponData?.coupon,
      },
    });
  }, [form.getValues()]);

  return (
    <Cards
      number={String(form.getValues("cardNumber") ?? "")}
      expiry={String(form.getValues("cardValidate") ?? "")}
      cvc={String(form.getValues("secreteCardNumber") ?? "")}
      name={String(form.getValues("cardHolderName") ?? "")}
      focused={dicionary[focusField]}
      placeholders={{
        name: "Nome do titular",
      }}
      locale={{
        valid: "Validade",
      }}
    />
  );
}
