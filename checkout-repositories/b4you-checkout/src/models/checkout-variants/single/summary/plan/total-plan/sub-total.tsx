import { useOfferPayment } from "@/hooks/states/checkout";

export function Subtotal() {
  const { offerPrice } = useOfferPayment();

  return (
    <div className="flex justify-between pb-5">
      <span className="block text-[0.875rem] font-medium text-[#262626]">
        Sub-total
      </span>
      <span className="block text-[0.875rem] font-medium text-[#4f4f4f]">
        {(offerPrice ?? 0).toLocaleString("pt-br", {
          currency: "BRL",
          style: "currency",
        })}
      </span>
    </div>
  );
}
