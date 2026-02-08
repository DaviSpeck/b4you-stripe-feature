import { useIsMutating } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ReactNode, useEffect, useMemo } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiDotsHorizontal } from "react-icons/hi";
import { v4 as uuid } from "uuid";
import {
  useOfferCoupon,
  useOfferPayment,
  useOfferShipping,
} from "@/hooks/states/checkout";
import { useOfferCheckoutSteps } from "@/hooks/states/checkout/three-steps";
import { useInstallmentTwoCards } from "@/hooks/states/checkout/useInstallmentTwoCards";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";
import { Card } from "@/components/ui/card";
import { CouponDiscountSummary } from "./coupon-discount";
import { PaymentMethodDiscount } from "./discount";
import { ShippingPriceSummary } from "./shipping-price";
import { SubTotalSummary } from "./sub-total";

export function TotalSummary() {
  const { offerData, getOfferPrice } = useOfferData();
  const { discountValue, offerPriceWithDiscount } = useOfferCoupon();
  const { shippingPrice } = useOfferShipping();
  const { secondStepFormData } = useOfferCheckoutSteps();
  const {
    paymentSelected,
    offerPrice,
    installmentOptions,
    getInstallmentSelected,
    orderBumps,
    set,
  } = useOfferPayment();
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

  const isFetching = Boolean(
    useIsMutating({
      mutationKey: ["frenet-options", secondStepFormData?.zipcode],
    }) |
    useIsMutating({
      mutationKey: ["frenet-option"],
    }),
  );

  if (!offerData) return <></>;

  const instalmentSelected = useMemo(
    () => (installmentOptions ? getInstallmentSelected() : null),
    [installmentOptions],
  );

  const price = offerPriceWithDiscount ?? offerPrice;

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

  const exibition = offerData.customizations.exibition_type;

  const exibitionType =
    exibition === "NaN" || !Boolean(exibition) ? 1 : exibition;

  return (
    <Card className="relative gap-3 border-none bg-[#f0f0f0] px-6 py-4 pb-7 shadow-none">
      {isFetching && <TotalSummary.Loading />}
      <SubTotalSummary />
      <PaymentMethodDiscount />
      {discountValue && <CouponDiscountSummary />}
      <ShippingPriceSummary />
      <div>
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2",
            paymentSelected === "TWO_CARDS" && "flex-col",
          )}
        >
          <span
            className={cn(
              "block text-[0.88rem] font-medium whitespace-nowrap text-[#262626]",
              paymentSelected === "TWO_CARDS" && "w-full",
            )}
          >
            Total:
          </span>
          {paymentSelected === "CARD" && Boolean(exibitionType) && (
            <TotalSummary.Card
              exibitionType={Number(exibitionType)}
              totalPrice={(price ?? 0) + (shippingPrice ?? 0)}
              installment={{
                number: instalmentSelected?.instalmentNumber ?? 12,
                price: Number(instalmentSelected?.value) ?? 0,
              }}
            />
          )}
          {paymentSelected === "TWO_CARDS" && Boolean(exibitionType) && (
            <div className="flex w-full flex-col gap-2">
              <div className="flex flex-col gap-2 rounded-[4px] border border-gray-300 p-4">
                <div className="flex flex-col">
                  <h3 className="text-[0.875rem] font-medium">Cartão 1</h3>
                  {lastFourDigitsCardOne && (
                    <div className="flex items-center gap-1.5 text-[0.875rem]">
                      <HiDotsHorizontal size={25} />
                      <span>{lastFourDigitsCardOne}</span>
                    </div>
                  )}
                  {!lastFourDigitsCardOne && (
                    <div className="flex items-center gap-1.5 text-[0.775rem]">
                      <span>Cartão não infomado</span>
                    </div>
                  )}
                </div>
                <TotalSummary.Card
                  totalPrice={cardOnePrice}
                  exibitionType={Number(exibitionType)}
                  isTwoCards
                  installment={{
                    number: cardOneInstallmentSelected ?? 1,
                    price:
                      cardOneInstallments.find(
                        ({ value }) => value === cardOneInstallmentSelected,
                      )?.price ?? 0,
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 rounded-[4px] border border-gray-300 p-4">
                <div className="flex flex-col">
                  <h3 className="text-[0.875rem] font-medium">Cartão 2</h3>
                  {lastFourDigitsCardTwo && (
                    <div className="flex items-center gap-1.5 text-[0.875rem]">
                      <HiDotsHorizontal size={25} />
                      <span>{lastFourDigitsCardTwo}</span>
                    </div>
                  )}
                  {!lastFourDigitsCardTwo && (
                    <div className="flex items-center gap-1.5 text-[0.775rem]">
                      <span>Cartão não infomado</span>
                    </div>
                  )}
                </div>
                <TotalSummary.Card
                  totalPrice={cardTwoPrice}
                  exibitionType={Number(exibitionType)}
                  isTwoCards
                  installment={{
                    number: cardTwoInstallmentSelected ?? 1,
                    price:
                      cardTwoInstallments.find(
                        ({ value }) => value === cardTwoInstallmentSelected,
                      )?.price ?? 0,
                  }}
                />
              </div>
            </div>
          )}
          {paymentSelected !== "CARD" && paymentSelected !== "TWO_CARDS" && (
            <p className="text-[1rem] font-normal">
              <span className="">À vista</span>{" "}
              <span className="font-medium text-[#20c374]">
                {((price ?? 0) + (shippingPrice ?? 0))?.toLocaleString(
                  "pt-br",
                  {
                    currency: "BRL",
                    style: "currency",
                  },
                )}
              </span>
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

TotalSummary.Loading = function () {
  return (
    <motion.div
      className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center rounded-[10px] bg-[#00000014]"
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AiOutlineLoading3Quarters size={30} className="animate-spin" />
    </motion.div>
  );
};

interface iPropsTotal {
  priceFormated: string;
  instalmentNumber: number | null;
}

TotalSummary.TypeOne = function (props: iPropsTotal) {
  const { priceFormated, instalmentNumber } = props;

  const { offerData } = useOfferData();

  if (!offerData) return <></>;

  return (
    <p
      className={cn(
        "justify-end text-[1rem] leading-3 font-medium whitespace-nowrap text-[#262626]",
        offerData.payment.student_pays_interest && "text-[0.95rem]",
      )}
    >
      Em até {instalmentNumber}x de{" "}
      <span className="font-semibold text-[#20c374]">
        {priceFormated}
        {!offerData?.payment.student_pays_interest && " sem juros"}
      </span>
    </p>
  );
};

TotalSummary.TypeTwo = function (props: iPropsTotal) {
  const { offerData } = useOfferData();

  const { priceFormated, instalmentNumber } = props;

  if (!offerData) return <></>;

  return (
    <p
      className={cn(
        "flex justify-end text-[1.2rem] leading-3 font-semibold whitespace-nowrap text-[#20c374]",
        offerData.payment.student_pays_interest && "text-[0.95rem]",
      )}
    >
      {instalmentNumber}x de {priceFormated}
      {instalmentNumber !== 1 && offerData.payment.student_pays_interest && "*"}
      {instalmentNumber !== 1 &&
        !offerData.payment.student_pays_interest &&
        " sem juros"}
    </p>
  );
};

TotalSummary.TypeThree = function (props: iPropsTotal) {
  const { offerData } = useOfferData();

  const { priceFormated, instalmentNumber } = props;

  if (!offerData) return <></>;

  return (
    <p className="flex justify-end text-[1rem] leading-3 font-normal">
      Parcelas de{" "}
      <span
        className={cn(
          "font-semibold text-[#20c374]",
          !offerData.payment.student_pays_interest && "text-[0.95rem]",
        )}
      >
        {priceFormated}
        {instalmentNumber !== 1 &&
          !offerData.payment.student_pays_interest &&
          " sem juros"}
      </span>
    </p>
  );
};

interface iCard {
  exibitionType: number;
  totalPrice: number;
  installment: {
    number: number;
    price: number;
  };
  isTwoCards?: boolean;
}

TotalSummary.Card = function (props: iCard) {
  const { exibitionType, totalPrice, installment, isTwoCards } = props;

  const { price, number } = installment;

  const priceFormated = Number(price).toLocaleString("pt-br", {
    currency: "BRL",
    style: "currency",
  });

  const TotalPriceText: ReactNode[] = [
    <TotalSummary.TypeOne
      key={uuid()}
      priceFormated={priceFormated}
      instalmentNumber={number}
    />,
    <TotalSummary.TypeTwo
      key={uuid()}
      priceFormated={priceFormated}
      instalmentNumber={number}
    />,
    <TotalSummary.TypeThree
      key={uuid()}
      priceFormated={priceFormated}
      instalmentNumber={number}
    />,
  ];

  return (
    <div
      className={cn(
        "flex flex-col gap-1 text-[0.75rem]",
        isTwoCards && "gap-0",
      )}
    >
      {TotalPriceText[Number(exibitionType) - 1]}{" "}
      {number > 1 && (
        <span className={cn("flex justify-end", isTwoCards && "justify-start")}>
          Ou{" "}
          {totalPrice?.toLocaleString("pt-br", {
            currency: "BRL",
            style: "currency",
          })}{" "}
          à vista
        </span>
      )}
    </div>
  );
};
