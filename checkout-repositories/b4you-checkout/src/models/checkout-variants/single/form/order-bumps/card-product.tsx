import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import clsx from "clsx";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { LiaHandPointRightSolid } from "react-icons/lia";
import { useOfferData } from "@/hooks/states/useOfferData";
import { OrderBumpsType, PaymentTypes } from "@/interfaces/offer";
import { cn } from "@/shared/libs/cn";
import { toPaymentMethod } from "@/tracking/eventTypes";
import { useCheckoutTracking } from "@/tracking/useCheckoutTracking";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { OnCheckParamsType, OnValueChangeParamsType } from ".";

interface iProps {
  orderBump: OrderBumpsType;
  paymentSelected: PaymentTypes;
  orderBumpsSelected: string[];
  onValueChange(params: OnValueChangeParamsType): void;
  onCheck(params: OnCheckParamsType): void;
}

export function CardProductItem(props: iProps) {
  const [isChecked, setIsCheked] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(0);

  const {
    orderBump,
    onValueChange,
    onCheck,
    orderBumpsSelected,
    paymentSelected,
  } = props;

  const { offerData } = useOfferData();
  const { trackEvent } = useCheckoutTracking({
    offerId: offerData?.uuid,
    checkoutType: "standard",
    autoTrackPageView: false,
    autoTrackSessionStart: false,
  });

  const isSubscription = orderBump.payment_type === "subscription";
  const isPixOrBillet =
    paymentSelected === "PIX" || paymentSelected === "BANK_SLIP";
  const isDisabled = isSubscription && isPixOrBillet;

  const lastAmountRef = useRef(0);

  let productImage = orderBump.alternative_image ?? orderBump.cover;

  if (!productImage) {
    productImage = orderBump.product.cover;
  }

  const priceBefore = orderBump.price_before.toLocaleString("pt-br", {
    currency: "BRL",
    style: "currency",
  });

  const priceAfter = orderBump.price.toLocaleString("pt-br", {
    currency: "BRL",
    style: "currency",
  });

  function handleOnAmountChange(value: number, track = true) {
    onValueChange({ newValue: value, orderBumpId: orderBump.uuid });
    setAmount(value);
    const previousAmount = lastAmountRef.current;
    lastAmountRef.current = value;
    if (!track) return;

    if (value > 0 && previousAmount === 0) {
      trackEvent("checkout_order_bump_accepted", {
        step: "payment",
        paymentMethod: toPaymentMethod(paymentSelected),
      });
    }

    if (value === 0 && previousAmount > 0) {
      trackEvent("checkout_order_bump_declined", {
        step: "payment",
        paymentMethod: toPaymentMethod(paymentSelected),
      });
    }
  }

  function handleOnCheckedChange(value: boolean, track = true) {
    onCheck({ isChecked: value, orderBumpId: orderBump.uuid });
    setIsCheked(value);
    if (!track) return;

    trackEvent(
      value ? "checkout_order_bump_accepted" : "checkout_order_bump_declined",
      {
        step: "payment",
        paymentMethod: toPaymentMethod(paymentSelected),
      },
    );
  }

  useEffect(() => {
    if (!orderBumpsSelected || orderBumpsSelected.length === 0) return;

    const isAmountOb = amount === 0 && orderBump.show_quantity;

    const orderAmount = orderBumpsSelected.filter(
      (obUuid) => obUuid === orderBump.uuid,
    ).length;

    if (isAmountOb) {
      handleOnAmountChange(orderAmount, false);
    }

    if (!orderBump.show_quantity) {
      handleOnCheckedChange(orderAmount > 0 ? true : false, false);
    }
  }, [orderBump]);

  useEffect(() => {
    if (isDisabled) {
      if (amount > 0) handleOnAmountChange(0, false);
      if (isChecked) handleOnCheckedChange(false, false);
    }
  }, [isDisabled]);

  return (
    <li
      className={clsx(
        "rounded-[5px] border p-4 shadow-[0_4px_1px_#e3e3e3] transition-opacity",
        isDisabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full items-center gap-2">
          <div
            className={cn(
              "max-w-[140px] min-w-[100px]",
              !productImage &&
                "flex h-35 w-35 items-center justify-center rounded-md border",
            )}
          >
            <img
              className={cn(
                "rounded-[6px] object-cover",
                !productImage && "h-17.5 w-17.5",
              )}
              src={productImage ?? "/no-camera.png"}
            />
          </div>
          <div className="text-[#535353]">
            <p className="text-[1rem] font-semibold max-[570px]:text-[0.775rem]">
              {orderBump?.product_name &&
                `${orderBump?.product_name.trim()} - `}
              {orderBump.label.trim()}
            </p>
            <p className="text-[1.25rem] leading-6 font-semibold max-[570px]:text-[1rem]">
              de <span className="line-through">{priceBefore}</span> por{" "}
              <span className="text-[#559b41]">{priceAfter}</span>
            </p>
          </div>
        </div>

        {orderBump.show_quantity ? (
          <CardProductItem.AmountAction
            amount={amount}
            onValueChange={handleOnAmountChange}
            isDisabled={isDisabled}
          />
        ) : (
          <CardProductItem.CheckAction
            isChecked={isChecked}
            onCheck={handleOnCheckedChange}
            isDisabled={isDisabled}
          />
        )}
      </div>
    </li>
  );
}

interface iAmountActionProps {
  amount: number;
  onValueChange(newValue: number): void;
  isDisabled: boolean;
}

CardProductItem.AmountAction = function (props: iAmountActionProps) {
  const { onValueChange, amount, isDisabled } = props;

  const isLoading = Boolean(useIsFetching());
  const isMutating = Boolean(useIsMutating());

  function onAdd() {
    onValueChange(amount + 1);
  }

  function onLess() {
    if (amount === 0) return;
    onValueChange(amount - 1);
  }

  return (
    <div className="flex w-full justify-start pl-3">
      <div className="flex items-center">
        <Button
          className={cn("", amount === 0 && "cursor-not-allowed")}
          disabled={amount === 0 || isLoading || isMutating || isDisabled}
          type="button"
          variant={"outline"}
          onClick={onLess}
        >
          <FaMinus />
        </Button>
        <span className="block w-9 text-center font-semibold">{amount}</span>
        <Button
          type="button"
          disabled={isLoading || isMutating || isDisabled}
          variant={"outline"}
          onClick={onAdd}
        >
          <FaPlus />
        </Button>
      </div>
    </div>
  );
};

interface iCheckActionProps {
  isChecked: boolean;
  onCheck(isChecked: boolean): void;
  isDisabled: boolean;
}

CardProductItem.CheckAction = function (props: iCheckActionProps) {
  const { onCheck, isChecked, isDisabled } = props;

  const isLoading = Boolean(useIsFetching());
  const isMutating = Boolean(useIsMutating());

  return (
    <div className="relative w-full">
      <Checkbox
        checked={isChecked}
        id="terms"
        disabled={isLoading || isMutating || isDisabled}
        className="h-5 w-5 cursor-pointer border-[2px] data-[state=checked]:border-[#7cd063] data-[state=checked]:bg-[#7cd063]"
        onCheckedChange={(value: boolean) => {
          onCheck(value);
        }}
      />
      {!isDisabled && (
        <motion.div
          className={cn("absolute -top-0.75 -left-8.5", isChecked && "hidden")}
          initial={{ x: 0 }}
          animate={{ x: [0, 5, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <LiaHandPointRightSolid
            className="bg-white"
            color="#535353"
            size={30}
          />
        </motion.div>
      )}
    </div>
  );
};
