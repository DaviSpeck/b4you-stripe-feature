import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { ReactNode } from "react";
import { GoCreditCard } from "react-icons/go";
import { MdPix } from "react-icons/md";
import { v4 as uuid } from "uuid";
import { useOfferData } from "@/hooks/states/useOfferData";
import { PaymentTypes } from "@/interfaces/offer";
import { cn } from "@/shared/libs/cn";
import { Button } from "@/components/ui/button";
import { upsellStorage } from "./storage";

type paymentOptions = {
  id: string;
  label: string;
  discoutPercent: number;
  value: PaymentTypes;
  icon: ReactNode;
};

export function BtnOptions() {
  const { getOfferPrice } = useOfferData();
  const { discount: CreditCardDiscount } = getOfferPrice("CARD");
  const { discount: PixDiscount } = getOfferPrice("PIX");

  const { paymentSelect, cardData } = upsellStorage();

  const isLoading = Boolean(useIsFetching());
  const isMutationCardInfo = Boolean(
    useIsMutating({ mutationKey: ["upsell-card-info"] }),
  );
  const isMutationPixInfo = Boolean(
    useIsMutating({ mutationKey: ["upsell-card-info"] }),
  );

  const paymentOptions: paymentOptions[] = [
    {
      id: uuid(),
      label: "Cartão de crédito",
      discoutPercent: CreditCardDiscount,
      value: "CARD",
      icon: <GoCreditCard />,
    },
    {
      id: uuid(),
      label: "PIX",
      discoutPercent: PixDiscount,
      value: "PIX",
      icon: <MdPix />,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {paymentOptions
        .filter((btnData) =>
          cardData?.allowed_payment_methods.some(
            (method) => method === btnData.value.toLowerCase(),
          ),
        )
        .map((btnData) => (
          <Button
            id={`${btnData.value.toLowerCase().replace("_", "-")}-option`}
            className={cn(
              "1.5s cursor-pointer rounded-[4px] bg-[#1b1b1b] text-[1rem] font-normal transition",
              btnData.value !== paymentSelect &&
                "border-[#1b1b1b] bg-transparent",
            )}
            disabled={isLoading || isMutationCardInfo || isMutationPixInfo}
            key={btnData.id}
            type="button"
            variant={btnData.value === paymentSelect ? "default" : "outline"}
            onClick={() => {
              upsellStorage.setState({ paymentSelect: btnData.value });
            }}
          >
            {btnData.icon}
            {btnData.label}{" "}
            {btnData.discoutPercent > 0 && (
              <span
                className={cn(
                  "rounded-[3px] bg-[#363636] px-1.5 py-0.5 text-[0.75rem] font-light transition-colors",
                  btnData.value !== paymentSelect && "bg-[#1b1b1b] text-white",
                )}
              >
                -{btnData.discoutPercent}%
              </span>
            )}
          </Button>
        ))}
    </div>
  );
}
