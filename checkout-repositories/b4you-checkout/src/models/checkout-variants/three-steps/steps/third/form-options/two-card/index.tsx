import { parseAsString, useQueryStates } from "nuqs";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import { CreditCardPaymentProcess } from "@/components/payment-process/credit-card";
import { paymentCreditCardDataType } from "@/components/payment-process/credit-card/interface";
import { PixPaymentProcess } from "@/components/payment-process/pix";
import { paymentPixDataType } from "@/components/payment-process/pix/interface";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps";
import { useInstallmentTwoCards } from "@/hooks/states/checkout/useInstallmentTwoCards";
import { useKonduto } from "@/hooks/states/useKonduto";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";
import { getFingerprint } from "@/shared/visitor-id";
import { Label } from "@/components/ui/label";
import { FormCreditCardValidation } from "./_schema";
import { CardOne } from "./card-one";
import { CardTwo } from "./card-two";

export const FormTwoCardInformations = forwardRef<{ execute: () => void }>(
  (_, ref) => {
    const cardFlagsUriArr = [
      "/card-flags/paymentmethodslightamericanexpress3203-2jw4.svg",
      "/card-flags/paymentmethodslightdinersclub3203-nqz8.svg",
      "/card-flags/paymentmethodslightdiscover3203-b54o.svg",
      "/card-flags/paymentmethodslightelo3203-zmb.svg",
      "/card-flags/paymentmethodslighthipercard3203-5i8.svg",
      "/card-flags/paymentmethodslightjcb3203-m7i.svg",
      "/card-flags/paymentmethodslightmaestro3203-r2a9.svg",
      "/card-flags/paymentmethodslightmastercard3203-sf1i.svg",
      "/card-flags/paymentmethodslightvisa3203-l31s.svg",
    ];

    const { offerData } = useOfferData();
    const { paymentSelected, set } = useOfferPayment();

    if (!offerData) return;

    return (
      <div
        className={cn(
          "flex w-full flex-col gap-4",
          !offerData.payment.methods.includes("credit_card") && "hidden",
        )}
        {...(paymentSelected !== "TWO_CARDS" && {
          onClick: () => {
            // form.clearErrors();
            set({ paymentSelected: "TWO_CARDS" });
          },
        })}
      >
        <div className="w-full">
          <div
            className={
              "flex w-full items-center space-x-3 rounded-md bg-[#f9f9f9] p-3"
            }
          >
            <input type="radio" checked={paymentSelected === "TWO_CARDS"} />
            <div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="payment-method-card">2 Cartões</Label>
                <div className="flex gap-1">
                  {cardFlagsUriArr.map((uri) => (
                    <img key={uuid()} src={uri} width="22px" height="15px" />
                  ))}
                </div>
              </div>
              <span className="text-[0.75rem] leading-0 font-medium text-[#20c374]">
                Em até {offerData.payment.installments}x
              </span>
            </div>
          </div>
        </div>
        {paymentSelected === "TWO_CARDS" && <CardsForm ref={ref} />}
      </div>
    );
  },
);

type CardInfoType = z.infer<typeof FormCreditCardValidation> & {
  amount: number;
};

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

const CardsForm = forwardRef<{
  execute: () => void;
}>((_, ref) => {
  const [isPixPayment, setIsPixPayment] = useState<boolean>(false);
  const [paymentPayload, setPaymentPayload] = useState<iPayload | null>(null);
  const [cardOne, setCardOne] = useState<null | CardInfoType>(null);
  const [cardTwo, setCardTwo] = useState<null | CardInfoType>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
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
  const {
    offerPrice,
    planId,
    orderBumps,
    set: setPayment,
    startCaptcha,
    getValidTurnstileToken,
    consumeTurnstileToken,
    isTurnstileTokenValid,
  } = useOfferPayment();
  const {
    cardOnePrice,
    cardTwoPrice,
    cardOneInstallments,
    cardOneInstallmentSelected,
    cardTwoInstallments,
    cardTwoInstallmentSelected,
  } = useInstallmentTwoCards();
  const { firstStepFormData, secondStepFormData } = useOfferCheckoutSteps();
  const { offerPriceWithDiscount, couponData } = useOfferCoupon();
  const { shippingPrice, frenetShippingOptions } = useOfferShipping();
  const { visitorId: kondutoId } = useKonduto();

  const pendingSubmitRef = useRef<null | (() => void)>(null);

  const cardOneRef = useRef<{
    execute: () => void;
    focus: () => void;
    reset: () => void;
  }>(null);

  const cardTwoRef = useRef<{
    execute: () => void;
    focus: () => void;
    reset: () => void;
  }>(null);

  useImperativeHandle(ref, () => ({
    execute: () => {
      cardOneRef.current?.execute();
      cardTwoRef.current?.execute();
    },
  }));

  function payloadFormatterPix(): paymentPixDataType {
    return {
      ...paymentPayload!,
      payment_method: "pix",
    };
  }

  function onReview() {
    setPaymentPayload(null);
    cardOneRef.current?.focus();
  }

  function onAddNewCard() {
    setPaymentPayload(null);
    cardOneRef.current?.reset();
    cardTwoRef.current?.reset();
  }

  useEffect(() => {
    if (!cardOne || !cardTwo) return;
    if (!firstStepFormData) return;
    if (offerData?.require_address && !secondStepFormData) return;

    const sendPayloadPayment = async () => {
      const turnstileToken = consumeTurnstileToken();
      if (!turnstileToken) return;

      const id = await getFingerprint();

      const visitorId = `${id}-${kondutoId}`;
      const sessionID = uuid()?.replace(/-/g, "").substring(0, 21);

      const firstCardInstallment = cardOneInstallments.find(
        (option) => option.value === cardOneInstallmentSelected,
      );

      const secondCardInstallment = cardTwoInstallments.find(
        (option) => option.value === cardTwoInstallmentSelected,
      );

      const payload: iPayload = {
        ...firstStepFormData,
        whatsapp: firstStepFormData.whatsapp.replace(/[^0-9]/g, ""),
        document_number: cardOne?.document.replace(/[^0-9]/g, ""),
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
            card_holder: cardOne.cardHolderName,
            card_number: cardOne.cardNumber.replace(/[^0-9]/g, ""),
            cvv: cardOne.secreteCardNumber.replace(/[^0-9]/g, ""),
            expiration_date: cardOne.cardValidate,
            document_number: cardOne.document?.replace(/[^0-9]/g, ""),
            installments: firstCardInstallment?.value ?? 12,
            amount: cardOnePrice,
          },
          {
            card_holder: cardTwo.cardHolderName,
            card_number: cardTwo.cardNumber.replace(/[^0-9]/g, ""),
            cvv: cardTwo.secreteCardNumber.replace(/[^0-9]/g, ""),
            expiration_date: cardTwo.cardValidate,
            document_number: cardTwo.document.replace(/[^0-9]/g, ""),
            installments: secondCardInstallment?.value ?? 12,
            amount: cardTwoPrice,
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

      if (
        offerData?.require_address &&
        firstStepFormData &&
        secondStepFormData
      ) {
        payload.address = {
          ...secondStepFormData,
          number: secondStepFormData.number_address,
        } as paymentCreditCardDataType["address"];
      }

      setPaymentPayload(payload);
    };

    sendPayloadPayment();
  }, [cardOne, cardTwo]);

  useEffect(() => {
    if (!offerPrice) return;
    const cashPayment = offerPriceWithDiscount ?? offerPrice ?? 0;
    const shippingValue = shippingPrice ?? 0;

    const totalPrice = cashPayment + shippingValue;

    useInstallmentTwoCards.setState({ cardOnePrice: totalPrice / 2 });
    useInstallmentTwoCards.setState({ cardTwoPrice: totalPrice / 2 });

    setTotalPrice(totalPrice);
  }, [offerPrice, shippingPrice, offerPriceWithDiscount]);

  async function buildPixPayload(): Promise<iPayload | null> {
    if (!offerData || !firstStepFormData || !cardOne || !cardTwo) return null;

    const turnstileToken = consumeTurnstileToken();
    if (!turnstileToken) return null;

    const id = await getFingerprint();
    const visitorId = `${id}-${kondutoId}`;
    const sessionID = uuid()?.replace(/-/g, "").substring(0, 21);

    const firstCardInstallment = cardOneInstallments.find(
      (option) => option.value === cardOneInstallmentSelected,
    );

    const secondCardInstallment = cardTwoInstallments.find(
      (option) => option.value === cardTwoInstallmentSelected,
    );

    const payload: iPayload = {
      ...firstStepFormData,
      whatsapp: firstStepFormData.whatsapp.replace(/[^0-9]/g, ""),
      document_number: cardOne.document.replace(/[^0-9]/g, ""),
      offer_id: offerData.uuid,
      order_bumps: orderBumps,
      coupon: couponData?.coupon ?? null,
      b4f: Boolean(searchParams.b4f) ? searchParams.b4f : null,
      type: offerData.payment.type,
      token: String(turnstileToken),
      payment_method: "pix",
      plan_id: planId,
      visitorId,
      sessionID,
      params: {},
      integration_shipping_company: null,
      integration_shipping_price: null,

      cards: [
        {
          card_holder: cardOne.cardHolderName,
          card_number: cardOne.cardNumber.replace(/[^0-9]/g, ""),
          cvv: cardOne.secreteCardNumber.replace(/[^0-9]/g, ""),
          expiration_date: cardOne.cardValidate,
          document_number: cardOne.document.replace(/[^0-9]/g, ""),
          installments: firstCardInstallment?.value ?? 12,
          amount: cardOnePrice,
        },
        {
          card_holder: cardTwo.cardHolderName,
          card_number: cardTwo.cardNumber.replace(/[^0-9]/g, ""),
          cvv: cardTwo.secreteCardNumber.replace(/[^0-9]/g, ""),
          expiration_date: cardTwo.cardValidate,
          document_number: cardTwo.document.replace(/[^0-9]/g, ""),
          installments: secondCardInstallment?.value ?? 12,
          amount: cardTwoPrice,
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

    if (offerData.require_address && secondStepFormData) {
      payload.address = {
        ...secondStepFormData,
        number: secondStepFormData.number_address,
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

  return (
    <div className="flex flex-col gap-4">
      <CardOne
        ref={cardOneRef}
        price={cardOnePrice}
        totalPrice={totalPrice}
        otherCardPrice={cardTwoPrice}
        onPayload={(cardData) => setCardOne(cardData)}
        onChangePrice={(newPrice) =>
          useInstallmentTwoCards.setState({ cardOnePrice: newPrice })
        }
      />
      <CardTwo
        ref={cardTwoRef}
        price={cardTwoPrice}
        totalPrice={totalPrice}
        otherCardPrice={cardOnePrice}
        onPayload={(cardData) => setCardTwo(cardData)}
        onChangePrice={(newPrice) =>
          useInstallmentTwoCards.setState({ cardTwoPrice: newPrice })
        }
      />
      {!isPixPayment && (
        <CreditCardPaymentProcess
          startPayment={Boolean(paymentPayload)}
          paymentInformations={paymentPayload}
          onReview={onReview}
          onAddNewCard={onAddNewCard}
          onSucess={() => setPayment({ isPaid: true })}
          onRequestPix={() => {
            pendingSubmitRef.current = async () => {
              const payload = await buildPixPayload();
              if (!payload) return;

              setPaymentPayload(payload);
              setIsPixPayment(true);
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
    </div>
  );
});
