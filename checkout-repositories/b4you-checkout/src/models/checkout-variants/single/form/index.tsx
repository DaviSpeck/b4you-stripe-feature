import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoShieldCheckmark } from "react-icons/io5";
import { RiFingerprintLine } from "react-icons/ri";
import { v4 as uuid } from "uuid";
import { fecthRead } from "@/utils/fetch";
import { useInitiateCheckoutEvent } from "@/hooks/integrations/pixel-events/useInitiateCheckout";
import {
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { queryClient } from "@/pages/_app";
import { iAbandonedCartResponse } from "@/pages/api/cart/find/[cartId]";
import { onOrderBumpsCheckedChange } from "@/shared/functions/order-bumps/on-order-bumps-cheked";
import { onOrderBumpsValueChange } from "@/shared/functions/order-bumps/on-order-bumps-value-changed";
import { findShippingType } from "@/shared/functions/shipping";
import { toPaymentMethod } from "@/tracking/eventTypes";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { Button } from "@/components/ui/button";
import { PopupCoupon } from "../../popup-coupon";
import { iAddress } from "../../three-steps/steps/second/interfaces";
import { FrenetShipping } from "../components/frenet-shipping";
import { AddressInfo } from "./address-info";
import { CouponPlanField } from "./coupon/plan";
import { CouponProductField } from "./coupon/product";
import { SpecialOffer } from "./order-bumps";
import { PaymentMethods } from "./payment";
import { PlanList } from "./plan-list";
import { useCheckoutStorage } from "./storage";
import { UserInfo } from "./user-info";

export function FormInformation() {
  const [isFetchingFrenet, setIsFetchingFrenet] = useState<boolean>(false);
  const [searchParams] = useQueryStates({
    cartId: parseAsString.withDefault(""),
    document: parseAsString.withDefault(""),
  });

  const pendingSubmitRef = useRef<null | (() => void)>(null);

  const userInformationFormRef = useRef<{
    execute: () => void;
  }>(null);

  const addressInformationFormRef = useRef<{
    execute: () => void;
  }>(null);

  const paymentMethodFormRef = useRef<{
    execute: () => void;
  }>(null);

  const isMutation = Boolean(useIsMutating());
  const isFetching = Boolean(useIsFetching());

  const { offerData } = useOfferData();
  const { addressInfo } = useCheckoutStorage();
  const { shippingPrice, isShippingRequired, shippingOrigin } = useOfferShipping();
  const {
    offerPrice,
    paymentSelected,
    planId,
    orderBumps,
    turnstileToken,
    isPaying,
    needsCaptcha,
    startCaptcha,
    getValidTurnstileToken,
    isTurnstileTokenValid,
    set,
  } = useOfferPayment();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  const shippingType = findShippingType({ offerData });

  const hasValidShipping =
    !isShippingRequired() ||
    shippingType === "FREE" ||
    shippingType === "FIX" ||
    (shippingType === "REGION" && shippingPrice !== null) ||
    (shippingType === "FRENET" && shippingPrice !== null);

  const addressDataCache = queryClient.getQueryData([
    "zipcode",
    addressInfo?.zipcode,
  ]) as Omit<iAddress, "number" | "complement"> | { error: boolean };

  const oldCartDataCache = queryClient.getQueryData([
    "old-cart",
    searchParams.cartId,
  ]) as null | iAbandonedCartResponse;

  // QUERY QUE BUSCA OS DADOS DO CARRINHO ABANDONADO
  const { isFetching: isFetchingOldCart } = fecthRead<iAbandonedCartResponse>({
    queryKey: ["old-cart", searchParams.cartId],
    route: `/cart/find/${searchParams.cartId}`,
    options: {
      enabled: !oldCartDataCache && Boolean(searchParams.cartId),
    },
  });

  const eventId = uuid();

  if (offerData) {
    useInitiateCheckoutEvent(offerData).handler({
      eventId,
      paymentData: {
        value: offerPrice ?? 0,
      },
      offerInformations: {
        uuid: offerData?.uuid ?? "",
        name: Boolean(offerData?.offer.alternative_name)
          ? offerData?.offer.alternative_name
          : offerData?.offer.name,
      },
    });
  }

  useEffect(() => {
    if (!pendingSubmitRef.current) return;
    if (!getValidTurnstileToken()) return;

    const submit = pendingSubmitRef.current;
    pendingSubmitRef.current = null;

    submit();
  }, [turnstileToken, getValidTurnstileToken]);

  const executeSubmit = () => {
    userInformationFormRef.current?.execute();
    addressInformationFormRef.current?.execute();
    paymentMethodFormRef.current?.execute();
  };

  if (!offerData || isFetchingOldCart) return <></>;

  return (
    <>
      <div className="rounded-[6px] bg-white p-6">
        <div className="flex w-full flex-col">
          <div className="flex flex-col gap-2">
            <UserInfo ref={userInformationFormRef} />
            <AddressInfo ref={addressInformationFormRef} />
          </div>
          <div className="pt-1">
            {planId ? <CouponPlanField /> : <CouponProductField />}
          </div>
          {isShippingRequired() &&
            findShippingType({ offerData }) === "FRENET" &&
            shippingOrigin !== "FRENET_FALLBACK" && (
              <div className="pt-2.5">
                <FrenetShipping
                  isError={"erro" in (addressDataCache ?? {})}
                  zipcode={
                    Boolean(addressInfo?.zipcode)
                      ? (addressInfo?.zipcode ?? "")
                      : null
                  }
                  onLoading={(isLoading) => setIsFetchingFrenet(isLoading)}
                />
              </div>
            )}
          <PaymentMethods ref={paymentMethodFormRef} />
          {offerData.payment.plans.length > 0 && <PlanList />}
          {offerData.order_bumps.length > 0 && (
            <div className="pt-4">
              <SpecialOffer
                orderBumpsSelected={orderBumps}
                paymentSelected={paymentSelected ?? "CARD"}
                onCheck={({ isChecked, orderBumpId }) =>
                  set({
                    orderBumps: onOrderBumpsCheckedChange({
                      isChecked,
                      orderBumpId,
                      orderBumpsSelected: orderBumps,
                    }),
                  })
                }
                onValueChange={({ newValue, orderBumpId }) =>
                  set({
                    orderBumps: onOrderBumpsValueChange({
                      newValue,
                      offerData,
                      orderBumpId,
                      orderBumpsSelected: orderBumps,
                    }),
                  })
                }
              />
            </div>
          )}
        </div>
        <Button
          id="btn-form-submit"
          className="mt-2.5 w-full cursor-pointer rounded-[10px] bg-[#36b90e] py-6 text-[1.12rem] font-normal hover:bg-[#2e9d0c]"
          type="button"
          disabled={
            isFetching ||
            isMutation ||
            isFetchingFrenet ||
            needsCaptcha ||
            isPaying ||
            (isShippingRequired() && !hasValidShipping)
          }
          onClick={() => {
            pendingSubmitRef.current = null;

            const shouldBlockCheckout =
              isShippingRequired() && !hasValidShipping;

            if (shouldBlockCheckout) {
              trackEvent("checkout_address_error", { step: "address" });
              return;
            }

            trackEvent("checkout_submit_clicked", {
              step: "payment",
              paymentMethod: toPaymentMethod(paymentSelected),
            });

            trackEvent("checkout_payment_data_started", {
              step: "payment",
              paymentMethod: toPaymentMethod(paymentSelected),
            });

            pendingSubmitRef.current = executeSubmit;

            if (!isTurnstileTokenValid()) {
              startCaptcha();
              return;
            }

            executeSubmit();
          }}
        >
          <span>Comprar agora</span>
          {(isFetching || isMutation || needsCaptcha || isPaying) && (
            <AiOutlineLoading3Quarters size={24} className="animate-spin" />
          )}
        </Button>
      </div>
      <PopupCoupon />
    </>
  );
}

FormInformation.TagsInformations = function () {
  return (
    <div className="flex flex-col gap-2.5 min-[660px]:flex-row">
      <div className="flex w-full items-center gap-2 rounded-[10px] border-1 border-[#0075ff] p-3.5 text-[0.75rem] text-[#0075ff]">
        <IoShieldCheckmark size={32} />
        <div>
          <h3 className="font-semibold">Compra Segura</h3>
          <span className="text-[0.75rem] whitespace-nowrap">
            Ambiente Seguro e Autenticado
          </span>
        </div>
      </div>
      <div className="flex w-full items-center gap-2 rounded-[10px] border-1 border-[#0075ff] p-3.5 text-[#0075ff]">
        <RiFingerprintLine size={40} />
        <div className="flex w-full flex-col items-center">
          <h3 className="w-full text-left font-semibold">Privacidade</h3>
          <span className="flex w-full justify-start text-[0.75rem]">
            Sua informação 100% segura
          </span>
        </div>
      </div>
    </div>
  );
};
