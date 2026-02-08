import { useEffect, useState } from "react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { iOffer } from "@/interfaces/offer";
import { Checkbox } from "@/components/ui/checkbox";

export function OrderBumpsItem(props: iOffer["order_bumps"][0]) {
  const [obAmount, setObAmount] = useState<number>(0);
  const [obIsChecked, setObIsChecked] = useState<boolean>(false);

  const {
    price,
    price_before,
    product,
    show_quantity,
    alternative_image,
    uuid,
    label,
    product_name,
  } = props;

  const { set: setOfferPayment, orderBumps } = useOfferPayment();

  function handleOnAmountChange(amount: number) {
    const orderBumpsFilter = orderBumps.filter((obUuid) => obUuid !== uuid);
    setOfferPayment({
      orderBumps: orderBumpsFilter.concat(
        Array.from({ length: amount }, () => uuid),
      ),
    });
  }

  function handleOnCheckedChange() {
    if (obIsChecked) {
      setOfferPayment({ orderBumps: orderBumps.concat([uuid]) });
      return;
    }
    setOfferPayment({
      orderBumps: orderBumps.filter((obUuid) => obUuid !== uuid),
    });
  }

  let image = product.cover;

  if (alternative_image) {
    image = alternative_image;
  }

  useEffect(() => {
    handleOnAmountChange(obAmount);
  }, [obAmount]);

  useEffect(() => {
    handleOnCheckedChange();
  }, [obIsChecked]);

  return (
    <li className="flex items-center gap-2 py-1.5">
      <div className="h-20 w-20 overflow-hidden rounded">
        <img src={image} alt="Imagem" className="h-full w-full object-cover" />
      </div>
      <div className="w-full">
        <h4 className="max-w-[calc(100%-100px)] text-[0.875rem] font-medium">
          {product_name && `${product_name.trim()} - `} {label.trim()}
        </h4>
        <div className="flex w-full justify-between">
          <div>
            <span className="block text-[0.75rem] font-semibold text-gray-500 line-through">
              De:{" "}
              {price_before.toLocaleString("pt-br", {
                currency: "BRL",
                style: "currency",
              })}
            </span>
            <span className="block text-[0.75rem] font-semibold text-[#20C374]">
              Por:{" "}
              {price.toLocaleString("pt-br", {
                currency: "BRL",
                style: "currency",
              })}
            </span>
          </div>
          {show_quantity && (
            <div className="flex justify-end">
              <div className="flex items-center">
                <button
                  className="cursor-pointer rounded-[4px] bg-[#EDEDED] px-2.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={obAmount === 0}
                  onClick={() => setObAmount((prevValue) => prevValue - 1)}
                >
                  -
                </button>
                <span className="block w-[35px] text-center text-[0.85rem]">
                  {obAmount}
                </span>
                <button
                  onClick={() => setObAmount((prevValue) => prevValue + 1)}
                  className="cursor-pointer rounded-[4px] bg-[#EDEDED] px-2.5 font-medium"
                >
                  +
                </button>
              </div>
            </div>
          )}
          {!show_quantity && (
            <div className="flex items-end">
              <div className="flex items-center justify-end gap-1.5">
                <span className="block text-[0.75rem] font-medium">
                  {obIsChecked ? "Remover" : "Adicionar"}
                </span>
                <Checkbox
                  id="terms"
                  className="h-4 w-4 cursor-pointer border-[2px] data-[state=checked]:border-[#7cd063] data-[state=checked]:bg-[#7cd063]"
                  checked={obIsChecked}
                  onCheckedChange={(value: boolean) => {
                    setObIsChecked(value);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
