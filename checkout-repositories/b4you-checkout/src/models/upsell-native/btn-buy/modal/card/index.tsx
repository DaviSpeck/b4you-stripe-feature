import { useState, useEffect } from "react";
import { useUpsellNativeStorage } from "@/models/upsell-native/storage";
import { CurrentCard } from "./current-card";
import { NewCard } from "./new-card";

export type CardPaymentType = "current" | "new";

export const CardPayment = () => {
  const { cardData } = useUpsellNativeStorage();

  const [cardPaymentType, setCardPaymentType] =
    useState<CardPaymentType>("new");

  useEffect(() => {
    if (cardData?.lastFourDigits) {
      setCardPaymentType("current");
    }
  }, [cardData]);

  return (
    <div className="flex flex-col gap-2">
      {cardData?.lastFourDigits && (
        <CurrentCard
          option={cardPaymentType}
          onSelect={() => setCardPaymentType("current")}
        />
      )}

      <NewCard
        option={cardPaymentType}
        onSelect={() => setCardPaymentType("new")}
      />
    </div>
  );
};