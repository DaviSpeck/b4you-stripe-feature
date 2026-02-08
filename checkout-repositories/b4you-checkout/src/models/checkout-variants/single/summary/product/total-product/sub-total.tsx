import { useOfferPayment } from "@/hooks/states/checkout";
import { cn } from "@/shared/libs/cn";

export function Subtotal() {
  const { offerOriginalPrice } = useOfferPayment();

  if (offerOriginalPrice === null) return <></>;

  return (
    <div className="flex justify-between">
      <span className="block text-[0.875rem] font-medium text-[#262626]">
        Sub-total
      </span>
      <span className={cn("block text-[0.875rem] font-medium text-[#4f4f4f]")}>
        {(offerOriginalPrice ?? 0).toLocaleString("pt-br", {
          currency: "BRL",
          style: "currency",
        })}
      </span>
    </div>
  );
}
