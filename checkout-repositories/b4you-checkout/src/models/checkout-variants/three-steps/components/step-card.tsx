import { motion } from "motion/react";
import { parseAsString, useQueryStates } from "nuqs";
import { ComponentProps, ReactElement, ReactNode } from "react";
import { PiNotePencil } from "react-icons/pi";
import { v4 as uuid } from "uuid";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";
import { Card } from "@/components/ui/card";

const stepsType = ["one", "two", "three"] as const;

interface iStepCard<TDataPrevius = null> extends ComponentProps<"div"> {
  step: (typeof stepsType)[number] | null;
  currentStep: (typeof stepsType)[number] | null;
  discountMessage?: ReactElement;
  children: ReactNode;
  previus?: ReactNode;
  disableEdit?: boolean;
  isRequiredAddress?: boolean;
  onStepClickEdit?: (stepNumber: (typeof stepsType)[number]) => void;
  stepInformation: {
    title: string;
    description: string;
    dataPrevius?: TDataPrevius | null;
  };
}

export function StepCard<TDataPrevius>(props: iStepCard<TDataPrevius>) {
  const [searchParams] = useQueryStates({
    step: parseAsString.withDefault(""),
  });

  const {
    stepInformation,
    step,
    children,
    currentStep,
    onStepClickEdit,
    discountMessage,
    previus,
    isRequiredAddress = true,
    ...CardProps
  } = props;

  const { className, ...otherProps } = CardProps;

  const handleEdit = () => step && onStepClickEdit && onStepClickEdit(step);

  const isBtnEdit: boolean =
    currentStep !== step &&
    stepInformation.dataPrevius &&
    !Boolean(searchParams.step)
      ? true
      : false;

  return (
    <Card
      className={cn(
        "relative flex min-w-[380px] items-start justify-start gap-2 p-6",
        className,
      )}
      {...otherProps}
    >
      <>
        <StepCard.Header<TDataPrevius>
          stepInformation={stepInformation}
          step={step}
          isRequiredAddress={isRequiredAddress}
          currentStep={currentStep ?? "one"}
          isEditing={currentStep === step}
        />
        {discountMessage && discountMessage}
        {currentStep !== step && previus && previus}
        {isBtnEdit && (
          <PiNotePencil
            size={22}
            className="text- absolute top-5 right-4 cursor-pointer text-[1rem] text-[#858585]"
            onClick={handleEdit}
          />
        )}
      </>

      {currentStep === step && (
        <motion.div
          className="w-full"
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: "auto",
            transition: {
              opacity: { duration: 0.2 },
              height: { duration: 0.3 },
            },
          }}
          exit={{
            opacity: 0,
            height: 0,
            transition: {
              opacity: { duration: 0.3, ease: "easeIn" },
              height: { duration: 0.2 },
            },
          }}
        >
          {children}
        </motion.div>
      )}
    </Card>
  );
}

interface iHeaderProps<TDataPrevius>
  extends Pick<
    iStepCard<TDataPrevius>,
    "stepInformation" | "step" | "isRequiredAddress"
  > {
  isEditing: boolean;
  currentStep: "one" | "two" | "three";
}

StepCard.Header = function <TDataPrevius>(props: iHeaderProps<TDataPrevius>) {
  const {
    stepInformation,
    isRequiredAddress = true,
    step = "one",
    isEditing,
    currentStep,
  } = props;

  const { offerData } = useOfferData();

  let customColor =
    (!stepInformation.dataPrevius || isEditing) &&
    Boolean(offerData?.checkout?.hex_color)
      ? offerData?.checkout?.hex_color
      : null;

  if (step !== currentStep) {
    customColor = "#c9c8c8";
  }

  if (stepInformation.dataPrevius) {
    customColor = "#20c374";
  }

  if (isEditing) {
    customColor = offerData?.checkout?.hex_color;
  }

  const IconStepNumber: Record<"one" | "two" | "three", ReactNode> = {
    one: (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          backgroundColor: customColor ?? "#c9c8c8",
        }}
      >
        <span className="h-fit pt-0.5 text-[18px] font-semibold text-white">
          1
        </span>
      </div>
    ),
    two: (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          backgroundColor: customColor ?? "#c9c8c8",
        }}
      >
        <span className="h-fit pt-0.5 text-[18px] font-semibold text-white">
          2
        </span>
      </div>
    ),
    three: (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{
          backgroundColor: customColor ?? "#c9c8c8",
        }}
      >
        <span className="h-fit pt-0.5 text-[18px] font-semibold text-white">
          3
        </span>
      </div>
    ),
  };

  return (
    <header
      className={cn(
        "flex flex-col gap-4",
        step !== IconStepNumber[step!] && "ba",
      )}
    >
      <div className="flex items-center gap-3">
        {step && IconStepNumber[!isRequiredAddress ? "two" : step]}
        <h3
          className={cn(
            "text-[1.188rem] font-semibold text-[#20c374]",
            (!stepInformation.dataPrevius || isEditing) && "text-[#452427]",
          )}
          {...(Boolean(customColor) && {
            style: { color: String(customColor) },
          })}
        >
          {stepInformation.title}
        </h3>
      </div>
      <p className="w-full text-[0.75rem] font-medium text-[#6b6b6b]">
        {stepInformation.description}
      </p>
    </header>
  );
};

interface iResumePrevius<TDataPrevius = {}>
  extends Pick<iHeaderProps<TDataPrevius>, "stepInformation"> {}

StepCard.ResumePrevius = function <TDataPrevius>(
  props: iResumePrevius<TDataPrevius>,
) {
  const { stepInformation } = props;

  if (!stepInformation.dataPrevius) return <></>;

  return (
    <main className="flex max-w-full flex-col gap-0.5 text-[0.9rem] font-normal">
      {Object.entries<string | null>(stepInformation.dataPrevius)
        .filter(([, value]) => Boolean(value))
        .map(([key, value]) => {
          return (
            <li
              key={uuid()}
              className="list-none overflow-hidden text-nowrap text-ellipsis"
            >
              <span
                id={`previus-information-${key}`}
                className="text-[0.75rem] font-medium"
              >
                {value}
              </span>
            </li>
          );
        })}
    </main>
  );
};
