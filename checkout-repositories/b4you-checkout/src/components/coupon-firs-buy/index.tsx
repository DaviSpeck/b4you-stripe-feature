import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef } from "react";
import { fecthMutation } from "@/utils/fetch";
import { useOfferCoupon, useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iCoupon } from "@/interfaces/coupon";
import { queryClient } from "@/pages/_app";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { ModalCouponApply } from "./modal-coupon-apply";
import { ModalCouponExpired } from "./modal-coupon-expired";
import { ModalInvalidCouponApplication } from "./modal-coupon-invalid";
import { ModalValidatingCoupon } from "./modal-validating-coupon";

interface iBody {
  email: string;
  phone: string;
  document_number: string;
  last_four: string | null | undefined;
}

interface iProps {
  isOpen: boolean;
  data: iBody;
}

export function CouponFirstBuy(props: iProps) {
  const [searchParams] = useQueryStates({
    productId: parseAsString.withDefault(""),
  });

  const { set: setOfferPayment, offerPrice } = useOfferPayment();
  const { set: setOfferCoupon } = useOfferCoupon();
  const { offerData } = useOfferData();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "3steps",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });
  const trackedErrorRef = useRef(false);

  const { isOpen, data } = props;

  const {
    mutate,
    isPending,
    isError,
    error,
    reset,
    data: couponData,
  } = fecthMutation<iCoupon, iBody>({
    route: `/coupon-validation/${searchParams.productId}`,
    method: "post",
    options: {
      onSuccess: (data) => {
        queryClient.setQueryData(["coupon-first-buy"], data);
      },
    },
  });

  function handleApplyCoupon() {
    if (!couponData || offerPrice === null) return;

    let price = offerPrice;

    if (couponData.percentage > 0) {
      const percent = 100 - couponData.percentage;
      price = offerPrice * (percent / 100);
    }

    if (couponData.amount > 0) {
      price = offerPrice - couponData.amount;
    }

    localStorage.setItem("isSetCouponFirstBuy", "true");

    setOfferPayment({
      isCouponFirstBuy: false,
      isPaying: true,
    });

    setOfferCoupon({
      couponData: couponData,
      discountType: couponData.percentage > 0 ? "percent" : "cashback",
      offerPriceWithDiscount: price,
      discountValue:
        couponData.percentage > 0 ? couponData.percentage : couponData.amount,
    });
    trackEvent("checkout_coupon_applied", {
      step: "payment",
    });
  }

  function handleCoupon() {
    reset();
    mutate({
      email: data.email,
      phone: data.phone,
      document_number: data.document_number,
      last_four: data.last_four,
    });
  }

  useEffect(() => {
    if (!isOpen || !data) return;
    handleCoupon();
  }, [isOpen]);

  useEffect(() => {
    if (!isError || !isOpen || trackedErrorRef.current) return;

    if (error?.status === 403 || error?.status === 400) {
      trackEvent("checkout_coupon_error", {
        step: "payment",
      });
      trackedErrorRef.current = true;
    }
  }, [isError, isOpen, error?.status, trackEvent]);

  useEffect(() => {
    if (!isOpen) {
      trackedErrorRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return <></>;

  if (isPending) return <ModalValidatingCoupon isOpen={isPending} />;

  if (isError && error?.status === 403 && isOpen) {
    return (
      <ModalInvalidCouponApplication
        isOpen={Boolean(isError && isOpen)}
        onTryAgain={handleCoupon}
        onKeepWithoutCoupon={() =>
          setOfferPayment({
            isCouponFirstBuy: false,
            isPaying: true,
          })
        }
      />
    );
  }

  if (isError && error?.status === 400 && isOpen) {
    return (
      <ModalCouponExpired
        isOpen={Boolean(isError && isOpen)}
        onClose={() =>
          setOfferPayment({
            isCouponFirstBuy: false,
            isPaying: true,
          })
        }
      />
    );
  }

  return (
    <ModalCouponApply
      isOpen={isOpen}
      onAccept={handleApplyCoupon}
      onRefuse={() =>
        setOfferPayment({
          isCouponFirstBuy: false,
          isPaying: true,
        })
      }
    />
  );
}
