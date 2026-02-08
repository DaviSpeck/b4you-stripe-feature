import { useEffect, useRef } from "react";
import { useOfferData } from "@/hooks/states/useOfferData";
import { PaymentTypes } from "@/interfaces/offer";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { CardProductItem } from "./card-product";

export type OnValueChangeParamsType = {
  newValue: number;
  orderBumpId: string;
};

export type OnCheckParamsType = {
  isChecked: boolean;
  orderBumpId: string;
};

interface iProps {
  paymentSelected: PaymentTypes;
  orderBumpsSelected: string[];
  onValueChange(params: OnValueChangeParamsType): void;
  onCheck(params: OnCheckParamsType): void;
}

export function SpecialOffer(props: iProps) {
  const { offerData } = useOfferData();

  const { onCheck, onValueChange, orderBumpsSelected, paymentSelected } = props;
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });
  const hasViewedRef = useRef(false);

  useEffect(() => {
    if (!offerData || offerData.order_bumps.length === 0) return;
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackEvent("checkout_order_bump_viewed", {
      step: "payment",
    });
  }, [trackEvent, offerData]);

  if (!offerData || offerData.order_bumps.length === 0) return <></>;

  return (
    <div className="rounded-[6px] border-[2px] border-dashed border-[#f00]">
      <header className="bg-[#edf2f5] p-2.5 text-center text-[1rem] font-semibold text-[#535353]">
        Ofertas especiais separadas, para você!
      </header>
      <ul className="flex w-full flex-col gap-4 p-4">
        {(offerData.product.type !== "physical"
          ? offerData.order_bumps.filter((ob) => ob.product.type !== "physical")
          : offerData.order_bumps
        ).map((item) => {
          return (
            <CardProductItem
              orderBumpsSelected={orderBumpsSelected}
              key={item.uuid}
              orderBump={item}
              paymentSelected={paymentSelected}
              onCheck={onCheck}
              onValueChange={onValueChange}
            />
          );
        })}
      </ul>
    </div>
  );
}
