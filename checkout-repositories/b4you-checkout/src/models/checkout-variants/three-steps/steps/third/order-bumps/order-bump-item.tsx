import { useIsFetching, useIsMutating } from "@tanstack/react-query";

import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iOffer } from "@/interfaces/offer";
import { cn } from "@/shared/libs/cn";
import { toPaymentMethod } from "@/tracking/eventTypes";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { Checkbox } from "@/components/ui/checkbox";
import noImage from "../../../../../../../public/no-camera.png";

export function OrderBumpsItem(props: iOffer["order_bumps"][0]) {
  const {
    price,
    price_before,
    label,
    product_name,
    product,
    show_quantity,
    alternative_image,
    uuid,
    paymentSelected,
    payment_type,
    cover,
  } = props;

  const isFetching = Boolean(
    useIsFetching() |
      useIsMutating({
        mutationKey: ["frenet-option"],
      }),
  );

  const { set: setOfferPayment, orderBumps } = useOfferPayment();
  const { offerData } = useOfferData();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "3steps",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });
  const lastAmountRef = useRef(0);

  function handleOnAmountChange(amount: number, track = true) {
    const orderBumpsFilter = orderBumps.filter((obUuid) => obUuid !== uuid);

    setOfferPayment({
      orderBumps: orderBumpsFilter.concat(
        Array.from({ length: amount }, () => uuid),
      ),
    });

    const previousAmount = lastAmountRef.current;
    lastAmountRef.current = amount;
    if (!track) return;

    if (amount > 0 && previousAmount === 0) {
      trackEvent("checkout_order_bump_accepted", {
        step: "payment",
        paymentMethod: toPaymentMethod(paymentSelected),
      });
    }

    if (amount === 0 && previousAmount > 0) {
      trackEvent("checkout_order_bump_declined", {
        step: "payment",
        paymentMethod: toPaymentMethod(paymentSelected),
      });
    }
  }

  function handleOnCheckedChange(isChecked: boolean, track = true) {
    if (isChecked) {
      setOfferPayment({ orderBumps: orderBumps.concat([uuid]) });
      if (track) {
        trackEvent("checkout_order_bump_accepted", {
          step: "payment",
          paymentMethod: toPaymentMethod(paymentSelected),
        });
      }
      return;
    }
    setOfferPayment({
      orderBumps: orderBumps.filter((obUuid) => obUuid !== uuid),
    });
    if (track) {
      trackEvent("checkout_order_bump_declined", {
        step: "payment",
        paymentMethod: toPaymentMethod(paymentSelected),
      });
    }
  }

  let image = alternative_image ?? cover;

  if (!image) {
    image = product.cover;
  }

  const isChecked = Boolean(orderBumps.find((obUuid) => uuid === obUuid));
  const obAmount = orderBumps.filter((obUuid) => uuid === obUuid).length;

  const isSubscription = payment_type === "subscription";
  const isPixOrBillet =
    paymentSelected === "PIX" || paymentSelected === "BANK_SLIP";
  const isDisabled = isSubscription && isPixOrBillet;

  useEffect(() => {
    if (isDisabled) {
      if (obAmount > 0) handleOnAmountChange(0, false);
      if (isChecked) handleOnCheckedChange(false, false);
    }
  }, [isDisabled]);

  useEffect(() => {
    lastAmountRef.current = obAmount;
  }, [obAmount]);

  return (
    <li
      className={clsx(
        "flex items-center gap-2 py-1.5",
        isDisabled && "cursor-not-allowed opacity-25",
      )}
    >
      <div
        className={cn(
          "max-w-[90px] min-w-[90px] overflow-hidden rounded object-fill max-[700px]:h-24 max-[700px]:w-24",
          !image && "flex h-[120px] items-center justify-center border",
        )}
      >
        <img
          src={image ?? noImage.src}
          alt="Imagem"
          className={cn("h-full w-full object-fill", !image && "h-12.5 w-12.5")}
        />
      </div>
      <div className="w-full">
        <h4 className="text-[0.875rem] leading-4 font-medium break-all max-[480px]:text-[0.700rem]">
          {product_name && `${product_name.trim()} - `}
          {label.trim()}
        </h4>
        <div className="flex w-full flex-wrap justify-between">
          <div className="p-3 pt-1 pl-0 whitespace-nowrap">
            <span className="block text-[0.75rem] font-semibold text-gray-500 line-through">
              De:{" "}
              {(price_before ?? 0).toLocaleString("pt-br", {
                currency: "BRL",
                style: "currency",
              })}
            </span>
            <span className="block text-[0.75rem] font-semibold text-[#20C374]">
              Por:{" "}
              {(price ?? 0).toLocaleString("pt-br", {
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
                  disabled={obAmount === 0 || isFetching || isDisabled}
                  type="button"
                  onClick={() => handleOnAmountChange(obAmount - 1)}
                >
                  -
                </button>
                <span className="block w-[35px] text-center text-[0.85rem]">
                  {obAmount}
                </span>
                <button
                  className="cursor-pointer rounded-[4px] bg-[#EDEDED] px-2.5 font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isFetching || isDisabled}
                  type="button"
                  onClick={() => handleOnAmountChange(obAmount + 1)}
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
                  {isDisabled
                    ? "indisponível"
                    : isChecked
                      ? "Remover"
                      : "Adicionar"}
                </span>
                {!isDisabled && (
                  <Checkbox
                    id="terms"
                    disabled={isFetching || isDisabled}
                    className="h-4 w-4 cursor-pointer border-[2px] data-[state=checked]:border-[#7cd063] data-[state=checked]:bg-[#7cd063]"
                    checked={isChecked}
                    onCheckedChange={handleOnCheckedChange}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
