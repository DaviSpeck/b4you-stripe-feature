import { FaCircleCheck } from "react-icons/fa6";
import { cn } from "@/shared/libs/cn";

interface iProps {
  stepColor: string;
  stepColorBackground: string;
  isVisible: boolean;
}

export const HeaderStep = (props: iProps) => {
  const { stepColorBackground, stepColor, isVisible } = props;

  if (!isVisible) return <></>;

  return (
    <div
      className="flex justify-center px-10 py-10 pt-3.5 pb-10"
      style={{ backgroundColor: stepColorBackground }}
    >
      <div className="flex w-full max-w-[600px]">
        <HeaderStep.ItemCheck label="Pedido" color={stepColor} isChecked />
        <HeaderStep.ItemCheck
          label="Compra efetuada"
          color={stepColor}
          isChecked
        />
        <HeaderStep.ItemCheck
          label="Você está aqui"
          color={stepColor}
          isCurrent
        />
        <HeaderStep.ItemCheck
          label="Pedido Finalizado"
          color={stepColor}
          isUncheck
          isLastItem
        />
      </div>
    </div>
  );
};

interface iItemCheck {
  label: string;
  color: string;
  isLastItem?: boolean;
  isChecked?: boolean;
  isCurrent?: boolean;
  isUncheck?: boolean;
}

HeaderStep.ItemCheck = (props: iItemCheck) => {
  const {
    label,
    color,
    isLastItem = false,
    isChecked = false,
    isCurrent = false,
    isUncheck = false,
  } = props;
  return (
    <div
      className={cn(
        "relative ml-[-2px] flex w-full flex-col items-start justify-start gap-1",
        isLastItem && "w-fit",
      )}
    >
      <div className={cn("flex w-full items-center p-[1px]")}>
        {isCurrent && (
          <div className="rounded-full border-[2px] border-[#8c8c8c] p-0.5">
            <div
              className="h-[10px] w-[10px] rounded-full"
              style={{
                backgroundColor: color,
              }}
            />
          </div>
        )}
        {isUncheck && (
          <div className="rounded-full border-[2px] border-[#8c8c8c] p-[7px]" />
        )}
        {isChecked && <FaCircleCheck className="block" color={color} />}
        {!isLastItem && (
          <div
            className="h-[1.5px] max-h-[2px] w-full bg-blue-600"
            style={{
              backgroundColor: color,
            }}
          />
        )}
      </div>
      <span
        className="absolute top-5 ml-[-34px] block w-[90px] pr-1.5 text-center text-[0.675rem] leading-[15px] min-[770px]:text-[0.775rem]"
        style={{
          color,
        }}
      >
        {label}
      </span>
    </div>
  );
};
