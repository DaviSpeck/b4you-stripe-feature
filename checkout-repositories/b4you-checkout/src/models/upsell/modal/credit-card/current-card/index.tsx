import { IoIosCheckmarkCircle } from "react-icons/io";
import { CardInformation } from "./card-information";

interface iProps {
  isSelected: boolean;
  onClick: VoidFunction;
}

export function CurrentCreditCard(props: iProps) {
  const { isSelected, onClick } = props;

  return (
    <div className="rounded-[10px] border-[1.5px] border-[#e4e7ec] p-4">
      <div className="flex gap-4">
        {isSelected ? (
          <IoIosCheckmarkCircle className="mt-1" size={23} color="#020246" />
        ) : (
          <button
            className="mt-1 h-[20px] w-[20px] cursor-pointer rounded-full border"
            onClick={onClick}
          />
        )}
        <div className="flex flex-col gap-1">
          <h3 className="text-[1rem] font-normal text-[#344054]">
            Pagar com cartão de crédito
          </h3>
          <p className="text-[0.875rem] font-normal text-[#667085]">
            Pague agora mesmo com seu cartão já utilizado
          </p>
        </div>
      </div>
      {isSelected && <CardInformation />}
    </div>
  );
}
