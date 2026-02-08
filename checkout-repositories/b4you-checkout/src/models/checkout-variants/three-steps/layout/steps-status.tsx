import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";

export function StepStatus() {
  const { offerData } = useOfferData();

  const {
    currentStep,
    firstStepFormData,
    secondStepFormData,
    thirdStepFormData,
  } = useOfferCheckoutSteps();

  return (
    <div className="flex w-full items-center gap-1">
      <div className="flex flex-col items-center justify-center">
        <span
          className={cn(
            "flex h-[1.625rem] w-[1.625rem] items-center justify-center rounded-full bg-[#cccccc]",
            (currentStep === "one" || Boolean(firstStepFormData)) &&
              "bg-[#20c374] text-white",
          )}
        >
          1
        </span>
        <span className="block text-[0.75rem]">Informações</span>
      </div>
      <div
        className={cn(
          "h-[1px] w-full bg-[#cccccc]",
          (currentStep === "two" || Boolean(firstStepFormData)) &&
            "bg-[#20c374]",
        )}
      />
      {offerData?.require_address && (
        <>
          <div className="flex flex-col items-center justify-center">
            <span
              className={cn(
                "flex h-[1.625rem] w-[1.625rem] items-center justify-center rounded-full bg-[#cccccc]",
                (currentStep === "two" || Boolean(secondStepFormData)) &&
                  "bg-[#20c374] text-white",
              )}
            >
              2
            </span>
            <span className="block text-[0.75rem]">Entrega</span>
            <div />
          </div>
          <div
            className={cn(
              "h-[1px] w-full bg-[#cccccc]",
              (currentStep === "three" || Boolean(thirdStepFormData)) &&
                "bg-[#20c374]",
            )}
          />
        </>
      )}
      <div className="flex flex-col items-center justify-center">
        <span
          className={cn(
            "flex h-[1.625rem] w-[1.625rem] items-center justify-center rounded-full bg-[#cccccc]",
            (currentStep === "three" || Boolean(thirdStepFormData)) &&
              "bg-[#20c374] text-white",
          )}
        >
          {offerData?.require_address ? "3" : "2"}
        </span>
        <span className="block text-[0.75rem]">Pagamento</span>
      </div>
    </div>
  );
}
