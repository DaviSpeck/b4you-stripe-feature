import { cnpj, cpf } from "cpf-cnpj-validator";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoTicketOutline } from "react-icons/io5";
import { fecthRead } from "@/utils/fetch";
import { useOfferCoupon, useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { usePixelStates } from "@/hooks/states/usePixel";
import { PaymentTypes } from "@/interfaces/offer";
import {
  CalcCouponDiscount,
  FeedbackApplyCoupon,
  parseCouponValidation,
  showInvalidCouponToast,
  type CouponValidationResponse,
} from "@/shared/functions/coupon";
import { cn } from "@/shared/libs/cn";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { Button } from "@/components/ui/button";

export function CouponPlan() {
  const [coupon, setCoupon] = useState("");
  const [helpText, setHelptext] = useState<string>("");
  const [isApplyCoupon, setIsApplyCoupon] = useState<boolean>(false);
  const [hasAppliedCoupon, setHasAppliedCoupon] = useState<boolean>(false);
  const lastAppliedCouponRef = useRef<{
    coupon: string;
    document: string;
  } | null>(null);
  const [searchParams] = useQueryStates({
    document: parseAsString.withDefault(""),
    coupon: parseAsString.withDefault(""),
  });

  const { offerData } = useOfferData();
  const {
    discountValue,
    offerPriceWithDiscount,
    set: setOfferCoupon,
  } = useOfferCoupon();
  const { planId, paymentSelected, offerPrice, offerOriginalPrice } =
    useOfferPayment();
  const { set: setPixelState } = usePixelStates();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "3steps",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });
  const trackedCouponRef = useRef<string | null>(null);

  const btnApply = useRef<HTMLButtonElement | null>(null);

  const queryKey = [
    "coupon",
    String(searchParams.document),
    String(coupon),
    String(paymentSelected),
  ];

  const isDocumentValid =
    !searchParams.document ||
    cpf.isValid(searchParams.document) ||
    cnpj.isValid(searchParams.document);

  const { data, isSuccess, isLoading, isError } =
    fecthRead<CouponValidationResponse>({
      queryKey,
      // strict_validation=true is an opt-in flag used only by the new checkout flow.
      route: `/coupon/${coupon}${searchParams.document ? `/${searchParams.document}` : ""}?strict_validation=true`,
      options: {
        enabled: isApplyCoupon && isDocumentValid,
      },
    });

  const pricesByPaymentMethod: Record<PaymentTypes, number> | null = offerData
    ? {
      CARD: offerData.prices.card,
      PIX: offerData.prices.pix,
      BANK_SLIP: offerData.prices.billet,
      TWO_CARDS: offerData.prices.card,
    }
    : null;

  function handleResetCouponAplication() {
    setPixelState({ coupon: null });
    setOfferCoupon({
      couponData: null,
      offerPriceWithDiscount: null,
      discountType: null,
      discountValue: null,
    });
    setHasAppliedCoupon(false);
    lastAppliedCouponRef.current = null;
  }

  function handleApplyCoupon(nextCoupon = coupon) {
    setHasAppliedCoupon(true);
    setIsApplyCoupon(true);
    lastAppliedCouponRef.current = {
      coupon: nextCoupon,
      document: searchParams.document,
    };
  }

  function handleSetCoupon() {
    const isCurrentApplication =
      lastAppliedCouponRef.current?.coupon === coupon &&
      lastAppliedCouponRef.current?.document === searchParams.document;

    if (!isCurrentApplication) return;

    if (searchParams.document && !isDocumentValid && isApplyCoupon) {
      setHelptext("CPF/CNPJ inválido");
      return;
    }

    const { coupon: couponData, invalidMessage } = parseCouponValidation(data);

    if (invalidMessage && isApplyCoupon) {
      setPixelState({ coupon: null });
      setHelptext(invalidMessage);
      showInvalidCouponToast(invalidMessage);
      setOfferCoupon({
        couponData: null,
        offerPriceWithDiscount: null,
        discountType: null,
        discountValue: null,
      });
      return;
    }

    if ((!couponData || couponData.already_used) && isApplyCoupon) {
      setPixelState({ coupon: null });
      setHelptext("Cupom inválido");
      setOfferCoupon({
        couponData: null,
        offerPriceWithDiscount: null,
        discountType: null,
        discountValue: null,
      });
      return;
    }

    if (!isSuccess || !isApplyCoupon || !isApplyCoupon) return;

    const priceTotal =
      offerPriceWithDiscount ?? offerPrice ?? offerOriginalPrice;

    if (priceTotal === null || priceTotal === undefined) return;

    if (!couponData) return;

    const message = FeedbackApplyCoupon({
      cuponInformations: couponData,
      offerData: {
        methodPayment: paymentSelected!,
        productsAmount: offerData!.quantity,
        priceTotal,
        enableTwoCardsPayment: !!offerData?.enable_two_cards_payment,
      },
    });

    setHelptext(message);

    if (trackedCouponRef.current !== coupon) {
      trackEvent(
        message === "Cupom inválido"
          ? "checkout_coupon_error"
          : "checkout_coupon_applied",
        {
          step: "payment",
        },
      );
      trackedCouponRef.current = coupon;
    }

    const discountType =
      couponData.percentage !== 0 ? "percent" : "cashback";
    const couponValue =
      couponData.percentage !== 0 ? couponData.percentage : couponData.amount;

    const offerWithDiscount = CalcCouponDiscount({
      couponValue: couponValue,
      discountType: discountType,
      priceToApplyDiscount: offerPrice ?? 0,
    });

    setOfferCoupon({
      discountType: message === "Cupom inválido" ? null : discountType,
      discountValue: message === "Cupom inválido" ? null : couponValue,
      couponData: message === "Cupom inválido" ? null : couponData,
      isShippingFree:
        message === "Cupom inválido" ? false : Boolean(couponData.free_shipping),
      offerPriceWithDiscount:
        message === "Cupom inválido" ? null : offerWithDiscount,
    });

    setPixelState({ coupon: couponData, totalPrice: offerWithDiscount });
  }

  useEffect(() => {
    handleSetCoupon();
  }, [
    isSuccess,
    isApplyCoupon,
    offerPrice,
    coupon,
    isDocumentValid,
    searchParams.document,
  ]);

  useEffect(() => {
    if (!offerData || !pricesByPaymentMethod) return;
    discountValue && handleResetCouponAplication();
  }, [coupon]);

  useEffect(() => {
    if (!isError) return;
    handleResetCouponAplication();
    if (trackedCouponRef.current !== coupon) {
      trackEvent("checkout_coupon_error", {
        step: "payment",
      });
      trackedCouponRef.current = coupon;
    }
  }, [isError]);

  useEffect(() => {
    if (!Boolean(searchParams.coupon)) return;
    const nextCoupon = !Boolean(coupon) ? searchParams.coupon : coupon;
    setCoupon(nextCoupon);
    if (isDocumentValid) {
      handleApplyCoupon(nextCoupon);
    }
  }, [searchParams.coupon, planId, searchParams.document]);

  useEffect(() => {
    if (!data) return;
    handleSetCoupon();
  }, [planId]);

  useEffect(() => {
    if (!searchParams.document || !isDocumentValid) return;

    if (coupon && hasAppliedCoupon) {
      handleApplyCoupon(coupon);
    }
  }, [searchParams.document, isDocumentValid, coupon, hasAppliedCoupon]);

  return (
    <div className="flex flex-col">
      <h4 className="text-[0.85rem] font-normal">Tem cupom?</h4>
      <div>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-[40px] w-full items-center gap-2 rounded-[8px] border border-[#ced4da] bg-white p-2",
              !isDocumentValid && "bg-gray-100",
            )}
          >
            <IoTicketOutline className="text-[#c5c1c1]" />
            <input
              disabled={isLoading || !isDocumentValid}
              value={coupon}
              type="text"
              className="h-full w-full outline-none placeholder:text-[0.9rem]"
              placeholder="Cupom de desconto"
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  btnApply.current?.click();
                }
              }}
              onChange={(e) => {
                isApplyCoupon && setIsApplyCoupon(false);
                handleResetCouponAplication();
                setHasAppliedCoupon(false);
                setCoupon(e.target.value);
                setHelptext("");
              }}
            />
          </div>
          <Button
            className="h-[40px] cursor-pointer bg-[#20c374] text-white hover:bg-[#20c374c1] disabled:cursor-not-allowed disabled:bg-transparent disabled:text-gray-500"
            ref={btnApply}
            disabled={isLoading || !Boolean(coupon) || !isDocumentValid}
            onClick={() => {
              handleApplyCoupon(coupon);
            }}
            variant={
              isLoading || !Boolean(coupon) || !isDocumentValid
                ? "outline"
                : "default"
            }
          >
            {isLoading && (
              <AiOutlineLoading3Quarters size={30} className="animate-spin" />
            )}
            {!isLoading && "Aplicar"}
          </Button>
        </div>
        {Boolean(helpText) && isSuccess && (
          <span
            className={cn(
              "pl-1.5 text-[0.75rem] text-red-600 underline",
              helpText === "Cupom válido" && "text-[#20c374]",
            )}
          >
            {helpText}
          </span>
        )}
      </div>
    </div>
  );
}
