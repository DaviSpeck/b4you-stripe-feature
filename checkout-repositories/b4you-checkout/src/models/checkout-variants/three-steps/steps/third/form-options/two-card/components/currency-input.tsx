import { PiCoins } from "react-icons/pi";
import { cn } from "@/shared/libs/cn";

interface iProps {
  price: number;
  otherCardPrice: number;
  totalOfferPrice: number;
  onValueChange: (value: number) => void;
}

export function CurrencyInput(props: iProps) {
  const { price, totalOfferPrice, otherCardPrice, onValueChange } = props;

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex h-[40px] w-full items-center gap-2 rounded-[4px] border border-[#dbd6db] p-2.5",
          price + otherCardPrice < (totalOfferPrice ?? 0) && "bg-[#ffdada]",
        )}
      >
        <PiCoins size={20} />
        <input
          className="w-full border-none text-[0.875rem] outline-none"
          inputMode="decimal"
          value={price.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
          onChange={(e) => {
            let raw = e.target.value;

            raw = raw.replace(/\D/g, "");

            let newCents = parseInt(raw, 10) || 0;

            if (raw.length <= 2) {
              newCents = newCents;
            } else {
              newCents = newCents;
            }

            onValueChange(newCents / 100);
          }}
        />
      </div>
      {price + otherCardPrice < (totalOfferPrice ?? 0) && (
        <span
          className={cn(
            "text-[0.775rem] font-medium text-gray-500",
            price + otherCardPrice < (totalOfferPrice ?? 0) && "text-[#e7000b]",
          )}
        >
          Valor restante:{" "}
          {((totalOfferPrice ?? 0) - (price + otherCardPrice)).toLocaleString(
            "pt-br",
            {
              currency: "BRL",
              style: "currency",
            },
          )}
        </span>
      )}
      {price + otherCardPrice > (totalOfferPrice ?? 0) && (
        <span className="text-[0.775rem] font-medium text-red-600">
          Valor excedido:{" "}
          {(price + otherCardPrice - (totalOfferPrice ?? 0)).toLocaleString(
            "pt-br",
            {
              currency: "BRL",
              style: "currency",
            },
          )}
        </span>
      )}
    </div>
  );
}
