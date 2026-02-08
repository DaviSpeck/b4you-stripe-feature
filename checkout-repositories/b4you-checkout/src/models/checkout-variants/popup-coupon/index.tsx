import { useEffect, useState } from "react";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { usePixelStates } from "@/hooks/states/usePixel";
import { CalcCouponDiscount } from "@/shared/functions/coupon";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function PopupCoupon() {
  const [isOpen, setIsOpen] = useState(false);
  const [alreadyShown, setAlreadyShown] = useState(false);
  const [isAbleToShow, setIsAbleToShow] = useState(false);

  const { offerData } = useOfferData();

  const { offerPrice } = useOfferPayment();
  const { set: setOfferCoupon } = useOfferCoupon();
  const { set: setPixelState } = usePixelStates();
  const { set: setOfferShipping } = useOfferShipping();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  function applyCoupon() {
    if (!offerData?.popup?.coupon) return;

    const { coupon } = offerData.popup;

    const discountType = coupon.percentage !== 0 ? "percent" : "cashback";
    const couponValue =
      coupon.percentage !== 0 ? coupon.percentage : coupon.amount;

    const offerWithDiscount = CalcCouponDiscount({
      couponValue: couponValue,
      discountType: discountType,
      priceToApplyDiscount: offerPrice ?? 0,
    });

    setOfferCoupon({
      discountType: discountType,
      discountValue: couponValue,
      couponData: coupon,
      isShippingFree: Boolean(coupon.free_shipping),
      offerPriceWithDiscount: offerWithDiscount,
    });

    setPixelState({ coupon: coupon, totalPrice: offerWithDiscount });

    if (Boolean(coupon.free_shipping)) {
      setOfferShipping({ shippingPrice: 0 });
    }

    trackEvent("checkout_coupon_applied", {
      step: "payment",
    });

    setIsOpen(false);
    setAlreadyShown(true);
  }

  // EFFCT DE DELAY MÍNIMO PARA MOSTRAR POPUP
  useEffect(() => {
    if (!offerData?.popup?.active || isAbleToShow || alreadyShown) return;
    setTimeout(
      () => setIsAbleToShow(true),
      Number(offerData.popup.popup_delay) * 1000,
    );
  }, [offerData]);

  // EFFECT RESPONSÁVEL POR EXIBIR POPUP QUANDO CURSOR SE MOVE PARA FORA DA TELA
  useEffect(() => {
    if (!offerData?.popup?.mouseMove || !offerData?.popup?.active) return;

    const handleMouseLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) {
        setIsOpen(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // EFFECT QUE MOSTRA O POPUP QUANDO USUÁRIO TENTA VOLTAR DE PÁGINA
  useEffect(() => {
    if (!offerData?.popup?.closePage || !isAbleToShow) return;

    window.history.pushState(null, "", window.location.href);

    const onPop = (e: PopStateEvent) => {
      e.preventDefault();
      setIsOpen(true);
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!offerData?.popup || !isAbleToShow || !alreadyShown) return;
    setTimeout(
      () => setIsOpen(true),
      (Number(offerData.popup.popup_delay) + 1) * 1000,
    );
  }, [isAbleToShow]);

  if (!offerData) return <></>;

  const { popup } = offerData;

  if (!popup || !popup?.active || alreadyShown) return <></>;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          setIsOpen(false);
          setAlreadyShown(true);
        }}
      >
        <DialogContent
          isBtnClose={false}
          className="flex flex-col gap-4 rounded-none border-none"
          style={{
            backgroundColor: popup.hex_color_bg,
          }}
        >
          <DialogTitle />
          <div className="flex flex-col items-center justify-center gap-6 rounded-[8px] border-[4px] border-dashed p-8">
            <div className="flex w-full flex-col gap-2">
              <span
                className="block text-center text-[1.75rem] font-semibold"
                style={{
                  color: popup.hex_color_text,
                }}
              >
                {popup.popup_title}
              </span>
              <span className="block bg-[#000] text-center text-[2.5rem] font-bold text-white">
                {popup.coupon.percentage > 0
                  ? `${popup.coupon.percentage}%`
                  : popup.coupon.amount.toLocaleString("pt-br", {
                      style: "currency",
                      currency: "BRL",
                    })}
                {popup.coupon.free_shipping && " + FRETE GRÁTIS"}
              </span>
              <div>
                <span
                  className="block text-center text-[1.75rem] font-semibold"
                  style={{
                    color: popup.hex_color_text,
                  }}
                >
                  {popup.popup_discount_text}
                </span>
                <span
                  className="block text-center text-[1rem] font-semibold"
                  style={{
                    color: popup.hex_color_text,
                  }}
                >
                  {popup.popup_secondary_text}
                </span>
              </div>
            </div>
            <button
              className="btn-accept cursor-pointer"
              style={{
                backgroundColor: popup.hex_color_button,
                color: popup.hex_color_button_text,
              }}
              onClick={applyCoupon}
            >
              {popup.popup_button_text}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
