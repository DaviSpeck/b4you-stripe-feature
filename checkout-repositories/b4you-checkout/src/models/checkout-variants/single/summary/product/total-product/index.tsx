import { memo, ReactNode, useEffect } from "react";
import { HiDotsHorizontal } from "react-icons/hi";
import { v4 as uuid } from "uuid";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useInstallmentTwoCards } from "@/hooks/states/checkout/useInstallmentTwoCards";
import { useOfferData } from "@/hooks/states/useOfferData";
import { CouponDiscount } from "./coupon-discount";
import { DiscountByPaymentMethod } from "./discount-by-payment-method";
import { Shipping } from "./shipping";
import { Subtotal } from "./sub-total";

export function TotalProduct() {
  const {
    offerPrice,
    installmentOptions,
    getInstallmentSelected,
    paymentSelected,
    orderBumps,
    set,
  } = useOfferPayment();
  const { offerData, getOfferPrice } = useOfferData();
  const { shippingPrice, shippingFree } = useOfferShipping();
  const { offerPriceWithDiscount, isShippingFree } = useOfferCoupon();
  const {
    cardOnePrice,
    cardTwoPrice,
    cardOneInstallments,
    cardTwoInstallments,
    cardOneInstallmentSelected,
    cardTwoInstallmentSelected,
    lastFourDigitsCardOne,
    lastFourDigitsCardTwo,
  } = useInstallmentTwoCards();

  const instalmentSelected = installmentOptions
    ? getInstallmentSelected()
    : null;

  useEffect(() => {
    if (!paymentSelected || !offerData) return;

    const filterOrderBumpsSelect = offerData.order_bumps.filter((order) =>
      orderBumps.includes(order.uuid),
    );

    const totalPrice = filterOrderBumpsSelect
      .map((order) => order.price)
      .reduce((acc, curr) => acc + curr, 0);

    const { discount, price } = getOfferPrice(paymentSelected);

    if (discount === 0) return;

    set({ offerPrice: price + totalPrice });
  }, [paymentSelected, orderBumps]);

  if (!offerData) return <></>;

  const exibitionType =
    Boolean(offerData.customizations?.exibition_type) &&
    offerData.customizations?.exibition_type !== "NaN"
      ? offerData.customizations?.exibition_type
      : 1;

  const cashPayment = offerPriceWithDiscount ?? offerPrice ?? 0;

  let shippingValue = shippingPrice ?? 0;

  if (shippingFree || isShippingFree) {
    shippingValue = 0;
  }

  return (
    <div>
      <div>
        <Subtotal />
        <DiscountByPaymentMethod />
        <CouponDiscount />
        <Shipping />
      </div>
      <div className="flex flex-col gap-2 border-t pt-4">
        <h4 className="text-[1rem] font-medium">Total a pagar:</h4>
        {paymentSelected === "CARD" && (
          <TotalProduct.Card
            totalPrice={cashPayment + shippingValue}
            exibitionType={Number(exibitionType)}
            installment={{
              price: Number(instalmentSelected?.value) ?? 0,
              number: instalmentSelected?.instalmentNumber ?? 1,
            }}
          />
        )}
        {paymentSelected === "TWO_CARDS" && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between rounded-[4px] border p-4">
              <TotalProduct.Card
                totalPrice={cardOnePrice}
                exibitionType={Number(exibitionType)}
                installment={{
                  number: cardOneInstallmentSelected ?? 1,
                  price:
                    cardOneInstallments.find(
                      ({ value }) => value === cardOneInstallmentSelected,
                    )?.price ?? 0,
                }}
              />
              <div className="flex flex-col justify-end">
                <h3 className="text-end text-[1rem] font-medium">Cartão 1</h3>
                {lastFourDigitsCardOne && (
                  <div className="flex items-center gap-1.5 text-[0.875rem]">
                    <HiDotsHorizontal size={25} />
                    <span>{lastFourDigitsCardOne}</span>
                  </div>
                )}
                {!lastFourDigitsCardOne && (
                  <div className="flex items-center gap-1.5 text-[0.875rem]">
                    <span>Cartão não infomado</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between rounded-[4px] border p-4">
              <TotalProduct.Card
                totalPrice={cardTwoPrice}
                exibitionType={Number(exibitionType)}
                installment={{
                  number: cardTwoInstallmentSelected ?? 1,
                  price:
                    cardTwoInstallments.find(
                      ({ value }) => value === cardTwoInstallmentSelected,
                    )?.price ?? 0,
                }}
              />
              <div className="flex flex-col justify-end">
                <h3 className="text-end text-[1rem] font-medium">Cartão 2</h3>
                {lastFourDigitsCardTwo && (
                  <div className="flex items-center gap-1.5 text-[0.875rem]">
                    <HiDotsHorizontal size={25} />
                    <span>{lastFourDigitsCardTwo}</span>
                  </div>
                )}
                {!lastFourDigitsCardTwo && (
                  <div className="flex items-center gap-1.5 text-[0.875rem]">
                    <span>Cartão não infomado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {paymentSelected !== "CARD" && paymentSelected !== "TWO_CARDS" && (
          <p className="text-[1rem] font-semibold">
            <span>
              {(cashPayment + shippingValue).toLocaleString("pt-br", {
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

interface iCard {
  exibitionType: number;
  totalPrice: number;
  installment: {
    number: number;
    price: number;
  };
}

TotalProduct.Card = function (props: iCard) {
  const { exibitionType, totalPrice, installment } = props;

  const { price, number } = installment;

  const { offerData } = useOfferData();

  const priceFormated = Number(price).toLocaleString("pt-br", {
    currency: "BRL",
    style: "currency",
  });

  const OfferTypeOne = memo(() => {
    return (
      <p className="text-[1.063rem] font-semibold text-[#0075ff]">
        Em até {number}x de {priceFormated}
        {number !== 1 && offerData?.payment.student_pays_interest && "*"}
      </p>
    );
  });

  const OfferTypeTwo = memo(() => {
    return (
      <p className="text-[1.063rem] font-semibold text-[#0075ff]">
        {number}x de {priceFormated}
        {number !== 1 && offerData?.payment.student_pays_interest && "*"}
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

  return (
    <div>
      <div className="flex flex-col gap-2 text-[0.75rem]">
        {TotalPriceText[Number(exibitionType) - 1]}{" "}
      </div>
      {installment && number > 1 && (
        <span className="block text-[0.875rem] font-normal">
          Ou{" "}
          {totalPrice.toLocaleString("pt-br", {
            currency: "BRL",
            style: "currency",
          })}{" "}
          à vista
        </span>
      )}
    </div>
  );
};
