import React, { useCallback, useEffect, useRef, useState } from "react";
import { fecthMutation } from "@/utils/fetch";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps";
import { useOfferData } from "@/hooks/states/useOfferData";
import { frenetBodyRequestType } from "@/interfaces/address";
import { PaymentTypes } from "@/interfaces/offer";
import { FrenetOptionType } from "@/pages/api/frenet";
import { findShippingType } from "@/shared/functions/shipping";
import { cn } from "@/shared/libs/cn";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { OrderBumpsItem } from "./order-bump-item";

export const OrderBumps = () => {
  const { paymentSelected } = useOfferPayment();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const { offerData } = useOfferData();
  const { orderBumps } = useOfferPayment();
  const { secondStepFormData } = useOfferCheckoutSteps();
  const {
    set: setOfferShipping,
    currentZipcode,
    shippingCompany,
    shippingFree,
  } = useOfferShipping();
  const { isShippingFree } = useOfferCoupon();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "3steps",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });
  const hasViewedRef = useRef(false);

  const { mutate, isPending } = fecthMutation<
    FrenetOptionType[],
    frenetBodyRequestType
  >({
    method: "post",
    route: "/frenet",
    options: {
      mutationKey: ["frenet-option"],
      onSuccess(data) {
        const optionShipping =
          data.find((option) => option.company === shippingCompany) ?? data[0];

        setOfferShipping({
          frenetShippingOptions: data,
          shippingPrice: optionShipping.price,
          currentZipcode: currentZipcode ?? secondStepFormData?.zipcode,
        });
      },
    },
  });

  const handleUpdateShipping = useCallback(() => {
    if (
      offerData &&
      findShippingType({ offerData }) !== "FRENET" &&
      (shippingFree || isShippingFree)
    ) {
      return;
    }
    mutate({
      cep: secondStepFormData!.zipcode,
      offer_id: offerData!.uuid,
      order_bumps: orderBumps,
    });
  }, [orderBumps, isPending]);

  useEffect(() => {
    if (shippingFree || isShippingFree) return;

    if (!isMounted) {
      setIsMounted(true);
      return;
    }
    offerData && offerData.has_frenet && handleUpdateShipping();
  }, [orderBumps]);

  useEffect(() => {
    if (!offerData || offerData.order_bumps.length === 0) return;
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;
    trackEvent("checkout_order_bump_viewed", {
      step: "payment",
    });
  }, [trackEvent, offerData]);

  if (!offerData) return <></>;

  if (!offerData.order_bumps || offerData.order_bumps.length === 0) {
    return <></>;
  }

  let paymentType: PaymentTypes | null = null;

  if (paymentSelected && paymentSelected === "TWO_CARDS") {
    paymentType = "CARD";
  } else {
    paymentType = paymentSelected ?? null;
  }

  return (
    <div className="overflow-hidden rounded-[8px] border-[2px] border-dashed border-[#f00]">
      <h1 className="bg-[#edf2f5] p-2 px-6 text-center text-[1rem] font-semibold text-[#535353]">
        Ofertas especiais separadas para você!
      </h1>
      <ul className="flex flex-col gap-2 p-0 px-6 py-2">
        {offerData.order_bumps.map((ob, i, arr) => {
          const lastItemIdex = arr.length - 1;

          return (
            <React.Fragment key={ob.uuid}>
              <OrderBumpsItem
                {...ob}
                paymentSelected={paymentType ?? undefined}
              />
              {lastItemIdex !== i && (
                <div className={cn("h-[0.5px] w-full bg-gray-300")} />
              )}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};
