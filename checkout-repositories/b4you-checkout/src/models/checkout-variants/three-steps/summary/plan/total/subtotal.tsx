import { useOfferPayment } from "@/hooks/states/checkout";

export function Subtotal() {
  const { offerOriginalPrice } = useOfferPayment();

  if (!offerOriginalPrice) return <></>;

  return (
    <div className="flex justify-between border-b-[1.5px] border-[#dfdfdf] pb-1.5">
      <span className="block text-[0.88rem] font-medium text-[#262626]">
        Valor original
      </span>
      <span className="block text-[1rem] font-medium text-[#4f4f4f]">
        {offerOriginalPrice.toLocaleString("pt-br", {
          currency: "BRL",
          style: "currency",
        })}
      </span>
    </div>
  );
}
