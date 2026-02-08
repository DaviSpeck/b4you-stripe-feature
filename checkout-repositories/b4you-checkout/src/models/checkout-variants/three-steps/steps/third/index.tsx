import { parseAsString, useQueryStates } from "nuqs";
import { CouponFirstBuy } from "@/components/coupon-firs-buy";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps/useOfferCheckoutSteps";
import { useOfferData } from "@/hooks/states/useOfferData";
import { StepCard } from "../../components";
import { FormThirdStep } from "./form";

export function ThirdSecond() {
  const [searchParams] = useQueryStates({
    document: parseAsString.withDefault(""),
  });

  const { currentStep, firstStepFormData } = useOfferCheckoutSteps();

  const { offerData } = useOfferData();

  const { isCouponFirstBuy } = useOfferPayment();

  if (!offerData) return <></>;

  return (
    <StepCard
      id="step-three"
      step={"three"}
      isRequiredAddress={offerData.require_address}
      currentStep={currentStep}
      className="w-full min-w-auto min-[800px]:w-187.5 min-[1200px]:w-100 md:h-fit"
      stepInformation={{
        title: "Pagamento",
        dataPrevius: null,
        description: "Escolha uma forma de Pagamento.",
      }}
    >
      <FormThirdStep />
      <CouponFirstBuy
        isOpen={
          isCouponFirstBuy &&
          !Boolean(localStorage.getItem("isSetCouponFirstBuy"))
        }
        data={{
          document_number: searchParams.document.replace(/\D/g, "") ?? "",
          email: firstStepFormData?.email ?? "",
          phone: firstStepFormData?.whatsapp.replace(/\D/g, "") ?? "",
          last_four: null,
        }}
      />
    </StepCard>
  );
}
