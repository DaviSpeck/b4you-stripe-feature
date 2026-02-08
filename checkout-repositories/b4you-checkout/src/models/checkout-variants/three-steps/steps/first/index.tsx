import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps/useOfferCheckoutSteps";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iOffer } from "@/interfaces/offer";
import { StepCard } from "../../components";
import { FormFirsStep } from "./form";
import { iFormDataFistStep } from "./interface";

export function FirstStep() {
  const { currentStep, set, firstStepFormData } = useOfferCheckoutSteps();
  const { offerData } = useOfferData();

  if (!offerData) return;

  return (
    <StepCard<iFormDataFistStep>
      className="h-fit w-full min-w-auto pb-6 min-[1200px]:w-[370px]"
      id={`step-one`}
      step={"one"}
      currentStep={currentStep}
      previus={<FirstStep.DataPrevius />}
      discountMessage={
        <FirstStep.MessegeDiscount discounts={offerData.discounts} />
      }
      onStepClickEdit={() => set({ currentStep: "one" })}
      stepInformation={{
        title: "Identifique-se",
        dataPrevius: firstStepFormData,
        description:
          "Solicitamos informações apenas para processamento da compra",
      }}
    >
      <FormFirsStep />
    </StepCard>
  );
}

type TextComponentType = {
  discount: number;
  type: "cartão" | "pix" | "boleto";
};

interface iMessegeDiscount extends Pick<iOffer, "discounts"> {}

FirstStep.MessegeDiscount = function (props: iMessegeDiscount) {
  const { discounts } = props;

  const { offerData } = useOfferData();

  let DiscountMessage: React.ReactElement | null = null;

  if (!offerData) return <></>;

  if (!discounts) return DiscountMessage;

  const TextComponent = (props: TextComponentType) => (
    <p className="animate-shake w-full bg-[#f4f6f8] p-3.5 text-[0.75rem] font-medium">
      Você ganhou{" "}
      <span className="text-[#008000]">{props.discount}% de desconto</span>{" "}
      pagando no {props.type}
    </p>
  );

  if (offerData.payment.methods.includes("credit_card") && discounts.card > 0) {
    DiscountMessage = <TextComponent discount={discounts.card} type="cartão" />;
  } else if (offerData.payment.methods.includes("pix") && discounts.pix > 0) {
    DiscountMessage = <TextComponent discount={discounts.pix} type="pix" />;
  } else if (
    offerData.payment.methods.includes("billet") &&
    discounts.billet > 0
  ) {
    DiscountMessage = (
      <TextComponent discount={discounts.billet} type="boleto" />
    );
  }

  return offerData.customizations.show_best_discount === "true" &&
    DiscountMessage
    ? DiscountMessage
    : null;
};

FirstStep.DataPrevius = function () {
  const { firstStepFormData } = useOfferCheckoutSteps();

  if (!firstStepFormData) return;

  return (
    <div>
      <span className="block text-[0.775rem] font-semibold">
        {firstStepFormData.full_name}
      </span>
      <span className="block text-[0.775rem]">{firstStepFormData.email}</span>
    </div>
  );
};
