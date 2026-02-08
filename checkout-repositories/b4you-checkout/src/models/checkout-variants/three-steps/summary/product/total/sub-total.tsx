import { useOfferCoupon, useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";

export function SubTotalSummary() {
  const { getOfferPrice } = useOfferData();

  const { offerOriginalPrice, paymentSelected } = useOfferPayment();
  const { offerPriceWithDiscount } = useOfferCoupon();

  if (offerOriginalPrice === null) return <></>;

  const { discount } = getOfferPrice(paymentSelected ?? "CARD");

  return (
    <div className="flex justify-between border-b-[1.5px] border-[#dfdfdf] pb-1.5">
      <span className="block text-[0.88rem] font-medium text-[#262626]">
        Valor original
      </span>
      <span
        className={cn(
          "block text-[1rem] font-medium text-[#4f4f4f]",
          (discount > 0 || Boolean(offerPriceWithDiscount)) && "line-through",
        )}
      >
        {offerOriginalPrice?.toLocaleString("pt-br", {
          currency: "BRL",
          style: "currency",
        })}
      </span>
    </div>
  );
}
