import Image from "next/image";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Timer } from "@/components/timer";
import { env } from "@/env";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iOffer } from "@/interfaces/offer";
import { apiInternal } from "@/services/axios";
import { cn } from "@/shared/libs/cn";
import { TurnstileComponent } from "@/shared/turnstile";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { PopupCoupon } from "../popup-coupon";
import { FormInformation } from "./form";
import { CustomHeader } from "./layout/custom-header";
import { SummaryTotal } from "./summary";

interface iProps {
  offerData: iOffer;
}

export function SingleCheckoutPage(props: iProps) {
  const [searchParams, setSearchParams] = useQueryStates({
    b4f: parseAsString.withDefault(""),
    offerId: parseAsString.withDefault(""),
    productId: parseAsString.withDefault(""),
  });

  const { offerData } = props;
  const { set } = useOfferData();
  const { isPaying, needsCaptcha } = useOfferPayment();

  useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
  });

  useEffect(() => {
    if (!offerData) return;
    set(offerData);
    setSearchParams({
      offerId: offerData.uuid,
      productId: String(offerData.product.id),
    });
  }, [offerData]);

  useEffect(() => {
    if (!searchParams.b4f) return;

    apiInternal.get(`/afiliate-cookies/${searchParams.b4f}`).catch(() => {
      // tracking não pode quebrar nada
    });
  }, [searchParams.b4f]);

  if (!offerData.checkout) return <></>;

  if (!offerData) {
    return (
      <div className="flex h-[calc(100vh)] items-center justify-center">
        <AiOutlineLoading3Quarters size={30} className="animate-spin" />
      </div>
    );
  }

  const sidebardPicture =
    offerData.image_offer.sidebar_picture ?? offerData.checkout.sidebar_picture;

  const shouldOpenCaptcha = needsCaptcha;

  return (
    <div
      className="relative h-[calc(100vh)] overflow-hidden"
      {...(offerData.checkout?.hex_color && {
        style: { backgroundColor: offerData.checkout?.hex_color },
      })}
    >
      <Timer offerData={offerData} />
      <main
        className={cn(
          "relative flex h-full w-full justify-center overflow-x-hidden pb-7.5",
          isPaying && env.NEXT_PUBLIC_NODE_ENV !== "test" && "overflow-hidden",
        )}
      >
        <div className="flex max-w-250 flex-col gap-4 p-6 max-[580px]:w-full max-[580px]:p-2">
          <CustomHeader />
          <div className="flex w-full flex-col gap-4 md:flex-row">
            <div className="flex w-full flex-col gap-4 pb-6">
              <FormInformation />
              <SummaryTotal />
            </div>
            {sidebardPicture && (
              <div className="checkout-colum-max flex flex-col md:w-3/10">
                <Image
                  src={sidebardPicture}
                  alt=""
                  width={900}
                  height={280}
                  quality={100}
                  className="h-auto w-full object-contain object-top md:max-w-[280px] lg:min-h-[900px] lg:min-w-[280px]"
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <TurnstileComponent
        isOpen={shouldOpenCaptcha}
      />

      <PopupCoupon />
    </div>
  );
}
