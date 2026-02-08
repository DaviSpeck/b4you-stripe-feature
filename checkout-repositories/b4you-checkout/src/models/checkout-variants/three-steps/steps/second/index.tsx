import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps/useOfferCheckoutSteps";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";
import { StepCard } from "../../components";
import { FormSecondStep } from "./form";
import { formAddressSecondStepSchema } from "./form-schema";
import { iFormDataSecondStep } from "./interfaces";

export function SecondStep() {
  const [isDisableEditBtn, setIsDisableEditBtn] = useState<boolean>(false);
  const [searchParams] = useQueryStates({
    integration: parseAsString.withDefault(""),
  });

  const { offerData } = useOfferData();

  const { currentStep, secondStepFormData, set } = useOfferCheckoutSteps();

  useEffect(() => {
    if (!secondStepFormData) return;

    async function validate() {
      const { success } =
        await formAddressSecondStepSchema.safeParseAsync(secondStepFormData);

      if (success && searchParams.integration === "free-sender") {
        setIsDisableEditBtn(true);
      }
    }

    validate();
  }, [secondStepFormData]);

  return (
    <StepCard<iFormDataSecondStep>
      id="step-two"
      step={"two"}
      currentStep={currentStep}
      onStepClickEdit={() => set({ currentStep: "two" })}
      className={cn(
        "relative h-fit w-full min-w-auto min-[1200px]:w-[370px]",
        !offerData?.require_address && "hidden",
      )}
      previus={<SecondStep.DataPrevius />}
      disableEdit={isDisableEditBtn}
      stepInformation={{
        title: "Entrega",
        dataPrevius: secondStepFormData,
        description: "Informe seu endereço para entrega.",
      }}
    >
      <FormSecondStep />
    </StepCard>
  );
}

SecondStep.DataPrevius = function () {
  const { secondStepFormData } = useOfferCheckoutSteps();

  if (!secondStepFormData) return;

  return (
    <div>
      <h3 className="text-[0.775rem] font-semibold">Endereço para entrega:</h3>
      <span className="block text-[0.775rem]">
        {secondStepFormData.street}, {secondStepFormData.number_address} -{" "}
        {secondStepFormData.neighborhood}
      </span>
      <div className="flex items-center gap-2">
        <span className="block text-[0.775rem]">
          {secondStepFormData.city} - {secondStepFormData.state}
        </span>
        <div className="h-[14px] w-px bg-gray-500" />
        <span className="block text-[0.775rem]">
          CEP: {secondStepFormData.zipcode}
        </span>
      </div>
    </div>
  );
};
