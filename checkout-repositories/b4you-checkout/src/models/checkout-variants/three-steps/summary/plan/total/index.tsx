import { motion } from "motion/react";
import { ReactNode } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { v4 as uuid } from "uuid";
import { useOfferCoupon, useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { cn } from "@/shared/libs/cn";
import { Card } from "@/components/ui/card";
import { DiscounOnlyMemberShip, DiscountByApplyCoupon } from "./discounts";
import { MembershipFee } from "./membership-fee";
import { ShippingPrice } from "./shipping";
import { Subtotal } from "./subtotal";

export function TotalPlan() {
  const { offerData } = useOfferData();
  const { planId, offerPrice, paymentSelected } = useOfferPayment();
  const { offerPriceWithDiscount } = useOfferCoupon();

  if (!offerPrice || !offerData) return <></>;

  const plan = offerData?.payment.plans.find((p) => p.uuid === planId);

  if (!plan) return <></>;

  return (
    <Card className="relative gap-3 border-none bg-[#f0f0f0] px-6 py-4 pb-7 shadow-none">
      <Subtotal />
      <DiscounOnlyMemberShip plan={plan} />
      <MembershipFee plan={plan} />
      <ShippingPrice />
      <DiscountByApplyCoupon />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="block text-[0.75rem] font-medium whitespace-nowrap text-[#262626]">
          Total a pagar:
        </span>
        {paymentSelected && plan && paymentSelected === "CARD" ? (
          <TotalPlan.TotalPricePaymentByCard />
        ) : (
          <p className="text-[1rem] font-normal">
            <span className="">À vista</span>{" "}
            <span className="font-medium text-[#20c374]">
              {(offerPriceWithDiscount ?? offerPrice)?.toLocaleString("pt-br", {
                currency: "BRL",
                style: "currency",
              })}
            </span>
          </p>
        )}
      </div>
    </Card>
  );
}

TotalPlan.TotalPricePaymentByCard = function () {
  const { offerData } = useOfferData();
  const {
    paymentSelected,
    offerPrice,
    installmentOptions,
    getInstallmentSelected,
  } = useOfferPayment();

  const { offerPriceWithDiscount } = useOfferCoupon();

  const instalmentSelected = installmentOptions
    ? getInstallmentSelected()
    : null;

  const priceFormated = Number(instalmentSelected?.value ?? 0).toLocaleString(
    "pt-br",
    { currency: "BRL", style: "currency" },
  );

  const TotalPriceText: ReactNode[] = [
    <TotalPlan.TypeOne
      key={uuid()}
      priceFormated={priceFormated}
      instalmentNumber={instalmentSelected?.instalmentNumber ?? null}
    />,
    <TotalPlan.TypeTwo
      key={uuid()}
      priceFormated={priceFormated}
      instalmentNumber={instalmentSelected?.instalmentNumber ?? null}
    />,
    <TotalPlan.TypeThree
      key={uuid()}
      priceFormated={priceFormated}
      instalmentNumber={instalmentSelected?.instalmentNumber ?? null}
    />,
  ];

  if (paymentSelected !== "CARD" || !offerData) return <></>;

  const exibition = offerData.customizations.exibition_type;

  const exibitionType =
    exibition === "NaN" || !Boolean(exibition) ? 1 : exibition;

  return (
    <div className="flex flex-col text-[0.75rem]">
      {TotalPriceText[Number(exibitionType) - 1]}{" "}
      {(instalmentSelected?.instalmentNumber ?? 0) > 1 && (
        <span className="flex justify-end">
          Ou{" "}
          {(offerPriceWithDiscount && offerPriceWithDiscount > 0
            ? offerPriceWithDiscount
            : offerPrice
          )?.toLocaleString("pt-br", {
            currency: "BRL",
            style: "currency",
          })}{" "}
          à vista
        </span>
      )}
    </div>
  );
};

TotalPlan.Loading = function () {
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

TotalPlan.TypeOne = function (props: iPropsTotal) {
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
        {offerData?.payment.student_pays_interest && " sem juros"}
      </span>
    </p>
  );
};

TotalPlan.TypeTwo = function (props: iPropsTotal) {
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

TotalPlan.TypeThree = function (props: iPropsTotal) {
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
