import { create } from "zustand";
import { formUserDataFirstStepSchema } from "@/models/checkout-variants/three-steps/steps/first/form-schema";
import { type iFormDataFistStep } from "@/models/checkout-variants/three-steps/steps/first/interface";
import { formAddressSecondStepSchema } from "@/models/checkout-variants/three-steps/steps/second/form-schema";
import { iFormDataSecondStep } from "@/models/checkout-variants/three-steps/steps/second/interfaces";
import { CardInfoType } from "@/models/checkout-variants/three-steps/steps/third/form-options/one-card";

interface iUserOfferCheckoutSteps {
  currentStep: "one" | "two" | "three" | null;
  firstStepFormData: null | iFormDataFistStep;
  secondStepFormData: null | iFormDataSecondStep;
  thirdStepFormData:
    | null
    | CardInfoType
    | Pick<CardInfoType, "document" | "isCnpj">;
  isFinalizingPurchase: boolean;
  reset: VoidFunction;
  stepSubmit(params: { hasFrenet: boolean; isRequiredAddress: boolean }): void;
  set(params: Partial<Omit<iUserOfferCheckoutSteps, "set">>): void;
}

export const useOfferCheckoutSteps = create<iUserOfferCheckoutSteps>()(
  (set, get) => ({
    currentStep: null,
    firstStepFormData: null,
    secondStepFormData: null,
    thirdStepFormData: null,
    isFinalizingPurchase: false,
    reset() {
      set({
        currentStep: "one",
        firstStepFormData: null,
        secondStepFormData: null,
        thirdStepFormData: null,
        isFinalizingPurchase: false,
      });
    },
    stepSubmit: async (params) => {
      const { hasFrenet, isRequiredAddress } = params;
      const { currentStep, firstStepFormData, secondStepFormData } = get();
      set({
        currentStep: await stepSubmit({
          firstStepFormData,
          secondStepFormData,
          hasFrenet,
          currentStep,
          isRequiredAddress,
        }),
      });
    },
    set(params) {
      set((states) => ({ ...states, ...params }));
    },
  }),
);

interface iStepSubmit
  extends Pick<
    iUserOfferCheckoutSteps,
    "firstStepFormData" | "secondStepFormData" | "currentStep"
  > {
  isRequiredAddress: boolean;
  hasFrenet: boolean;
}

type ReturnType = Pick<iUserOfferCheckoutSteps, "currentStep">["currentStep"];

async function stepSubmit(params: iStepSubmit): Promise<ReturnType> {
  const {
    firstStepFormData,
    secondStepFormData,
    hasFrenet,
    currentStep,
    isRequiredAddress,
  } = params;

  const isValidaFirstStep =
    formUserDataFirstStepSchema.safeParse(firstStepFormData);

  const isValidaSecondStep =
    await formAddressSecondStepSchema.safeParseAsync(secondStepFormData);

  if (hasFrenet && currentStep === "one" && isRequiredAddress) {
    return "two";
  }

  if (
    currentStep === "two" &&
    isRequiredAddress &&
    !isValidaFirstStep.success
  ) {
    return "one";
  }

  if (
    currentStep === "one" &&
    !isValidaSecondStep.success &&
    isRequiredAddress
  ) {
    return "two";
  }

  return "three";
}
