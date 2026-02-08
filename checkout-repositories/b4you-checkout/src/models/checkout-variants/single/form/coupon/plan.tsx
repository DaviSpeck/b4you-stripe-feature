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
import { Input } from "@/components/ui/input";

export function CouponPlanField() {
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
  const { discountValue, set: setOfferCoupon } = useOfferCoupon();
  const { set: setPixelState } = usePixelStates();
  const { paymentSelected, planId, offerPrice, offerOriginalPrice } =
    useOfferPayment();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
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
        TWO_CARDS: offerData.prices.card,
        CARD: offerData.prices.card,
        PIX: offerData.prices.pix,
        BANK_SLIP: offerData.prices.billet,
      }
    : null;

  function handleResetCouponAplication() {
    setPixelState({ coupon: null });
    setHelptext("");
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

  useEffect(() => {
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

    const priceTotal = offerOriginalPrice ?? offerPrice;

    if (priceTotal === null || priceTotal === undefined) return;

    if (!couponData) return;

    const message = FeedbackApplyCoupon({
      cuponInformations: couponData,
      offerData: {
        methodPayment: paymentSelected!,
        priceTotal,
        productsAmount: offerData!.quantity,
        enableTwoCardsPayment: offerData!.enable_two_cards_payment,
      },
    });

    setHelptext(message);

    if (trackedCouponRef.current !== coupon) {
      trackEvent(
        message === "Cupom válido"
          ? "checkout_coupon_applied"
          : "checkout_coupon_error",
        {
          step: "payment",
        },
      );
      trackedCouponRef.current = coupon;
    }

    if (message !== "Cupom válido") return;

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
      discountType: discountType,
      discountValue: couponValue,
      couponData: couponData,
      offerPriceWithDiscount: offerWithDiscount,
    });

    setPixelState({ coupon: couponData, totalPrice: offerWithDiscount });
  }, [isSuccess, isApplyCoupon, coupon, isDocumentValid, searchParams.document]);

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
    if (!searchParams.document || !isDocumentValid) return;

    if (coupon && hasAppliedCoupon) {
      handleApplyCoupon(coupon);
    }
  }, [searchParams.document, isDocumentValid, coupon, hasAppliedCoupon]);

  return (
    <div className="flex flex-col pt-1">
      <div className="min-[770px]:flex min-[770px]:flex-row min-[770px]:gap-2">
        <div className="flex w-full flex-col min-[770px]:flex-col">
          <div className="flex w-full items-center">
            <div
              className={cn(
                "flex h-10 w-full items-center gap-3 rounded-[4px] rounded-r-none border border-[#ced4da] bg-white p-2 px-3",
                (isLoading || !isDocumentValid) && "bg-gray-100",
              )}
            >
              <IoTicketOutline />
              <input
                className="h-full w-full outline-none placeholder:text-[0.9rem]"
                value={coupon}
                type="text"
                disabled={isLoading || !isDocumentValid}
                placeholder="Cupom de desconto"
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
              className="h-10 rounded-[4px] rounded-l-none border-[#007bff] bg-[#007bff] p-2 font-normal text-white hover:border-[#007bff] hover:bg-[#007bff] disabled:border-gray-500 disabled:text-black"
              disabled={isLoading || !Boolean(coupon) || !isDocumentValid}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  btnApply.current?.click();
                }
              }}
              type="button"
              onClick={() => {
                handleApplyCoupon(coupon);
              }}
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
                "block pl-1.5 text-[0.75rem] text-red-600 underline",
                helpText === "Cupom válido" && "text-[#20c374]",
              )}
            >
              {helpText}
            </span>
          )}
        </div>
        <Input
          disabled
          className="m-0 hidden w-full border-none p-0 disabled:hidden disabled:opacity-0 min-[770px]:disabled:block"
        />
      </div>
    </div>
  );
}
