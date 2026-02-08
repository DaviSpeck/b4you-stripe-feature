import { useRouter } from "next/router";
import { useState, useCallback, useMemo } from "react";
import { fecthMutation } from "@/utils/fetch";
import {
  iUpsellCardTokenizedPaymentBody,
  iUpsellCardTokenizedPaymentResponse,
} from "@/interfaces/upsell";
import { BtnUpsellBuy } from "../components/button/buy";
import { useUpsellNativeStorage } from "../storage";
import { ModalPayment } from "./modal";

interface iProps {
  text: string;
  fontSize: string;
  btnColor: string;
  color: string;
}

export const BtnBuy = (props: iProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    planSelect,
    offerSelectUuid,
    isOneClick,
    saleItemId,
  } = useUpsellNativeStorage();

  const router = useRouter();

  const { mutate, isPending } = fecthMutation<
    iUpsellCardTokenizedPaymentBody,
    iUpsellCardTokenizedPaymentResponse
  >({
    method: "post",
    route: "/payment/upsell/card-tokenized",
    options: {
      mutationKey: ["upsell-payment-by-card-tokenized"],
      onSuccess(data) {
        router.replace(`/payment-thanks/${data.sale_item_id}`);
      },
    },
  });

  const isPlanConsistent = useMemo(() => {
    if (!planSelect) return true;
    return planSelect.offer_uuid === offerSelectUuid;
  }, [planSelect, offerSelectUuid]);

  const readyToPay = useMemo(() => {
    return Boolean(offerSelectUuid && isPlanConsistent);
  }, [offerSelectUuid, isPlanConsistent]);

  const canOneClick = useMemo(() => {
    return readyToPay && isOneClick;
  }, [readyToPay, isOneClick]);

  const handleSubmit = useCallback(() => {
    if (!saleItemId || !offerSelectUuid) return;
    if (!isPlanConsistent) return;

    mutate({
      offer_id: offerSelectUuid,
      plan_id: planSelect?.uuid ?? null,
      sale_item_id: saleItemId,
      payment_method: "card",
      installments: 1,
    });
  }, [
    mutate,
    offerSelectUuid,
    planSelect,
    saleItemId,
    isPlanConsistent,
  ]);

  return (
    <>
      <BtnUpsellBuy
        {...props}
        loading={isPending}
        onClick={() =>
          canOneClick ? handleSubmit() : setIsModalOpen(true)
        }
      />

      <ModalPayment
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};