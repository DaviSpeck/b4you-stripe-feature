import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import { Timer } from "@/components/timer";
import { useInitiateCheckoutEvent } from "@/hooks/integrations/pixel-events/useInitiateCheckout";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iOffer } from "@/interfaces/offer";
import { apiInternal } from "@/services/axios";
import { cn } from "@/shared/libs/cn";
import { TurnstileComponent } from "@/shared/turnstile";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { PopupCoupon } from "../popup-coupon";
import { FooterPage } from "./layout/footer";
import { HaderPage } from "./layout/header";
import { StepStatus } from "./layout/steps-status";
import { FirstStep } from "./steps/first";
import { SecondStep } from "./steps/second";
import { ThirdSecond } from "./steps/third";
import { SummaryOffer } from "./summary";

export type installmentType = {
  maxInstallments: number;
  interestRate: number;
};

interface iCheckoutPageProps {
  offer: iOffer;
}

export function CheckoutThreeStepsPage(props: iCheckoutPageProps) {
  const [searchParams, setSearchParams] = useQueryStates(
    {
      b4f: parseAsString.withDefault(""),
      offerId: parseAsString.withDefault(""),
      productId: parseAsString.withDefault(""),
    },
    { clearOnDefault: true },
  );

  const { offer } = props;
  const { set, offerData } = useOfferData();
  const { offerPrice } = useOfferPayment();

  const {
    configurePurchaseDetails,
    needsCaptcha,
    set: setOfferPayment,
  } = useOfferPayment();

  const { set: setOfferSteps, currentStep } = useOfferCheckoutSteps();

  const { trackEvent } = useCheckoutTracking({
    offerId: offer?.uuid,
    checkoutType: "3steps",
  });

  const lastStepRef = useRef<typeof currentStep>(null);

  useEffect(() => {
    if (!offer) return;
    set(offer);
    setSearchParams({
      offerId: offer.uuid,
      productId: String(offer.product.id),
    });
  }, [offer]);

  useEffect(() => {
    if (!searchParams.b4f) return;

    apiInternal.get(`/afiliate-cookies/${searchParams.b4f}`).catch(() => {
      // tracking não pode quebrar nada
    });
  }, [searchParams.b4f]);

  useEffect(() => {
    if (!offerData) return;
    configurePurchaseDetails(offerData);
    setOfferSteps({ currentStep: "one" });

    if (offerData.payment.methods.includes("credit_card")) {
      setOfferPayment({ paymentSelected: "CARD" });
      return;
    }

    if (offerData.payment.methods.includes("pix")) {
      setOfferPayment({ paymentSelected: "PIX" });
      return;
    }

    if (offerData.payment.methods.includes("billet")) {
      setOfferPayment({ paymentSelected: "BANK_SLIP" });
      return;
    }
  }, [offerData]);

  useEffect(() => {
    if (!currentStep) return;

    const stepMap = {
      one: "identification",
      two: "address",
      three: "payment",
    } as const;

    const currentStepLabel = stepMap[currentStep];

    trackEvent("checkout_step_viewed", {
      step: currentStepLabel,
    });

    if (lastStepRef.current) {
      const order = {
        one: 1,
        two: 2,
        three: 3,
      };

      const previous = lastStepRef.current;
      const previousOrder = order[previous];
      const currentOrder = order[currentStep];

      if (currentOrder > previousOrder) {
        trackEvent("checkout_step_advanced", {
          step: currentStepLabel,
        });
      } else if (currentOrder < previousOrder) {
        trackEvent("checkout_step_back", {
          step: currentStepLabel,
        });
      }
    }

    lastStepRef.current = currentStep;
  }, [currentStep, trackEvent]);

  const eventId = uuid();

  if (offerData) {
    useInitiateCheckoutEvent(offerData).handler({
      eventId,
      paymentData: {
        value: offerPrice ?? 0,
      },
      offerInformations: {
        uuid: offerData?.uuid ?? "",
        name: Boolean(offerData?.offer.alternative_name)
          ? offerData?.offer.alternative_name
          : offerData?.offer.name,
      },
    });
  }

  if (!offerData) return <></>;

  const shouldOpenCaptcha = needsCaptcha;

  return (
    <div
      id="page-checkout"
      className="h-[calc(100vh)] w-full overflow-hidden overflow-y-auto"
    >
      <HaderPage />
      <Timer offerData={offerData} />
      <div
        className={cn(
          "flex justify-center bg-[#f5f5f5] px-10 py-7 pb-[0px] min-[797px]:hidden",
        )}
      >
        <StepStatus />
      </div>
      <main className="flex min-h-[calc(100%-270px)] flex-col justify-center gap-2 bg-[#f5f5f5] px-4 py-10 max-[788px]:pt-6 min-[800px]:flex-col min-[1200px]:flex-row">
        <div className="min-[767px]:hidden">
          <SummaryOffer />
        </div>
        <div className="flex w-full flex-col gap-2 min-[1200px]:w-auto md:flex-row">
          <div className="flex w-full flex-col gap-2 min-[1200px]:w-auto">
            <FirstStep />
            <SecondStep />
          </div>
          <ThirdSecond />
        </div>
        <div className="block max-[767px]:hidden">
          <SummaryOffer />
        </div>
      </main>
      <FooterPage />

      <TurnstileComponent
        isOpen={shouldOpenCaptcha}
      />

      <PopupCoupon />
    </div>
  );
}
