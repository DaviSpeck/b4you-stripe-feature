import { IoHandLeftSharp } from "react-icons/io5";
import { MdOutlineKeyboardDoubleArrowDown } from "react-icons/md";

interface iProps {
  alertNotClosePrimaryColor: string;
  alertNotClosePrimaryTextColor: string;
  isVisible: boolean;
}

export const CardMessageNotClose = (props: iProps) => {
  const {
    alertNotClosePrimaryColor,
    alertNotClosePrimaryTextColor,
    isVisible,
  } = props;

  if (!isVisible) return <></>;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 px-4 py-0">
      <div
        className="flex max-w-[450px] items-center gap-2.5 bg-[#0f1b35] p-4"
        style={{ backgroundColor: alertNotClosePrimaryColor }}
      >
        <div className="flex items-center justify-center rounded-full bg-white p-2.5 text-[25px]">
          <IoHandLeftSharp
            className="text-[1.5rem]"
            color={alertNotClosePrimaryColor}
          />
        </div>
        <div className="flex flex-col justify-center">
          <h4
            className="m-0 text-[0.75rem] font-semibold text-white min-[800px]:text-[0.875rem]"
            style={{ color: alertNotClosePrimaryTextColor }}
          >
            Não feche essa página!
          </h4>
          <span
            className="text-[0.675rem] text-white min-[800px]:text-[0.775rem]"
            style={{ color: alertNotClosePrimaryTextColor }}
          >
            Não aperte o botão voltar para evitar cobrança duplicada
          </span>
        </div>
      </div>
      <MdOutlineKeyboardDoubleArrowDown className="animate-pulse" size={30} />
    </div>
  );
};
