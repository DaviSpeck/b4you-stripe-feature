import { memo, ReactNode } from "react";
import { v4 as uuid } from "uuid";
import { useOfferCoupon, useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { CouponDiscount } from "./coupon-discount";
import { Subtotal } from "./sub-total";

export function TotalPlan() {
  const {
    offerPrice,
    installmentOptions,
    getInstallmentSelected,
    paymentSelected,
  } = useOfferPayment();
  const { offerData } = useOfferData();
  const { offerPriceWithDiscount } = useOfferCoupon();

  const instalmentSelected = installmentOptions
    ? getInstallmentSelected()
    : null;

  const priceFormated = Number(instalmentSelected?.value ?? 0).toLocaleString(
    "pt-br",
    { currency: "BRL", style: "currency" },
  );

  const OfferTypeOne = memo(() => {
    return (
      <p className="text-[1.063rem] font-semibold text-[#0075ff]">
        Em até {instalmentSelected?.instalmentNumber}x de {priceFormated}
      </p>
    );
  });

  const OfferTypeTwo = memo(() => {
    return (
      <p className="text-[1.063rem] font-semibold text-[#0075ff]">
        {instalmentSelected?.instalmentNumber}x de {priceFormated}
        {instalmentSelected?.instalmentNumber !== 1 && "*"}
      </p>
    );
  });

  const OfferTypeThree = memo(() => {
    return (
      <p className="text-[1.063rem] font-semibold text-[#0075ff]">
        Parcelas de {priceFormated}
      </p>
    );
  });

  const TotalPriceText: ReactNode[] = [
    <OfferTypeOne key={uuid()} />,
    <OfferTypeTwo key={uuid()} />,
    <OfferTypeThree key={uuid()} />,
  ];

  if (!offerData) return <></>;

  const exibitionType =
    Boolean(offerData.customizations?.exibition_type) &&
    offerData.customizations?.exibition_type !== "NaN"
      ? offerData.customizations?.exibition_type
      : 1;

  const cashPayment = offerPriceWithDiscount ?? offerPrice ?? 0;

  return (
    <div>
      <div>
        <Subtotal />
        <CouponDiscount />
      </div>
      <div className="flex flex-col gap-2 border-t pt-4">
        <h4 className="text-[1rem] font-medium">Total a pagar:</h4>
        {paymentSelected === "CARD" && (
          <div>
            <div className="flex flex-col gap-2 text-[0.75rem]">
              {TotalPriceText[Number(exibitionType) - 1]}{" "}
            </div>
            <span className="block text-[0.875rem] font-normal">
              Ou{" "}
              {cashPayment.toLocaleString("pt-br", {
                currency: "BRL",
                style: "currency",
              })}{" "}
              à vista
            </span>
          </div>
        )}
        {paymentSelected !== "CARD" && (
          <p className="text-[1rem] font-semibold">
            <span>
              {cashPayment.toLocaleString("pt-br", {
                currency: "BRL",
                style: "currency",
              })}
            </span>{" "}
            <span>à vista</span>{" "}
          </p>
        )}
      </div>
    </div>
  );
}
