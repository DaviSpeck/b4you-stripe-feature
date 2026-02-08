import { useIsFetching } from "@tanstack/react-query";
import { ReactNode } from "react";
import { GoCreditCard } from "react-icons/go";
import { GrDocumentText } from "react-icons/gr";
import { MdPix } from "react-icons/md";
import { v4 as uuid } from "uuid";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iOffer, PaymentTypes } from "@/interfaces/offer";
import { cn } from "@/shared/libs/cn";
import { Button } from "@/components/ui/button";

type paymentOptions = {
  id: string;
  label: string;
  discoutPercent: number;
  value: PaymentTypes;
  icon: ReactNode;
};

interface iProps {
  currentTypeSelected: PaymentTypes | "TWO-CARDS";
  onChange(value: PaymentTypes): void;
}

export function BtnOptions(props: iProps) {
  const { onChange, currentTypeSelected } = props;

  const { getOfferPrice, offerData } = useOfferData();
  const { paymentSelected } = useOfferPayment();

  const isFetching = Boolean(useIsFetching());

  if (!paymentSelected) return <></>;

  const { discount: CreditCardDiscount } = getOfferPrice("CARD");
  const { discount: PixDiscount } = getOfferPrice("PIX");
  const { discount: BankSlipDiscount } = getOfferPrice("BANK_SLIP");

  const dictOptions: Record<
    PaymentTypes,
    iOffer["payment"]["methods"][number]
  > = {
    TWO_CARDS: "credit_card",
    CARD: "credit_card",
    BANK_SLIP: "billet",
    PIX: "pix",
  };

  const paymentOptions: paymentOptions[] = [
    {
      id: uuid(),
      label: "Cartão de crédito",
      discoutPercent: CreditCardDiscount,
      value: "CARD",
      icon: <GoCreditCard />,
    },
    {
      id: uuid(),
      label: "2 Cartões de crédito",
      discoutPercent: CreditCardDiscount,
      value: "TWO_CARDS",
      icon: (
        <div className="relative">
          <svg
            width="32"
            height="32"
            aria-hidden="true"
            focusable="false"
            data-prefix="far"
            data-icon="credit-card"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 634 469"
          >
            <path
              d="M589.068 59H150.004C125.663 59 105.988 78.675 105.988 102.925V425.039C105.988 449.289 125.663 468.964 150.004 468.964H589.068C613.41 468.964 633.085 449.289 633.085 425.039V102.925C633.085 78.675 613.41 59 589.068 59ZM155.495 102.925H583.578C586.598 102.925 589.068 105.395 589.068 108.415V146.849H150.004V108.415C150.004 105.395 152.475 102.925 155.495 102.925ZM583.578 425.039H155.495C152.475 425.039 150.004 422.569 150.004 419.549V263.982H589.068V419.549C589.068 422.569 586.598 425.039 583.578 425.039ZM281.687 333.529V370.133C281.687 376.173 276.745 381.115 270.706 381.115H204.819C198.779 381.115 193.837 376.173 193.837 370.133V333.529C193.837 327.49 198.779 322.548 204.819 322.548H270.706C276.745 322.548 281.687 327.49 281.687 333.529ZM457.386 333.529V370.133C457.386 376.173 452.444 381.115 446.405 381.115H321.951C315.912 381.115 310.97 376.173 310.97 370.133V333.529C310.97 327.49 315.912 322.548 321.951 322.548H446.405C452.444 322.548 457.386 327.49 457.386 333.529Z"
              fill="currentColor"
            ></path>{" "}
            <path
              d="M529.068 0H90.004C65.663 0 45.988 19.675 45.988 43.925V366.039C45.988 390.289 65.663 409.964 90.004 409.964H143.488C143.488 384 143.488 256.25 143.488 232V98L573.085 91.5V43.925C573.085 19.675 553.41 0 529.068 0ZM95.4949 43.925H523.578C526.598 43.925 529.068 46.395 529.068 49.415V75H121.988V154H90.004V49.415C90.004 46.395 92.4749 43.925 95.4949 43.925ZM173.988 366.039H134.741H95.4949C92.4749 366.039 90.004 363.569 90.004 360.549V204.982H136.488L134.741 366.039C-189.839 371.529 173.988 366.039 173.988 366.039Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      ),
    },
    {
      id: uuid(),
      label: "PIX",
      discoutPercent: PixDiscount,
      value: "PIX",
      icon: <MdPix />,
    },
    {
      id: uuid(),
      label: "Boleto",
      discoutPercent: BankSlipDiscount,
      value: "BANK_SLIP",
      icon: <GrDocumentText />,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {paymentOptions
        .filter((option) => {
          const method = dictOptions[option.value as keyof typeof dictOptions];
          return (
            offerData?.payment.methods.includes(method) &&
            (offerData?.enable_two_cards_payment ||
              option.value !== "TWO_CARDS")
          );
        })
        .map((btnData) => (
          <Button
            id={`${btnData.value.toLowerCase().replace("_", "-")}-option`}
            key={btnData.id}
            type="button"
            disabled={isFetching}
            variant={
              btnData.value === currentTypeSelected ? "default" : "outline"
            }
            onClick={() => onChange(btnData.value)}
            className={cn(
              "1.5s cursor-pointer rounded-[4px] bg-[#1b1b1b] text-[1rem] font-normal transition",
              btnData.value !== currentTypeSelected &&
              "border-[#1b1b1b] bg-transparent",
            )}
          >
            {btnData.icon}
            {btnData.label}{" "}
            {btnData.discoutPercent > 0 && (
              <span
                className={cn(
                  "rounded-[3px] bg-[#363636] px-1.5 py-0.5 text-[0.75rem] font-light transition-colors",
                  btnData.value !== currentTypeSelected &&
                  "bg-[#1b1b1b] text-white",
                )}
              >
                -{btnData.discoutPercent}%
              </span>
            )}
          </Button>
        ))}
    </div>
  );
}
