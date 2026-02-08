import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GoCreditCard } from "react-icons/go";
import { MdPix } from "react-icons/md";
import { toast } from "sonner";
import { fecthMutation } from "@/utils/fetch";
import { ModalPaymentProcess } from "@/models/upsell/modal/credit-card/modal-process";
import { queryClient } from "@/pages/_app";
import {
  iUpsellNativePaymentBody,
  iUpsellNativePaymentBodyResponseType,
} from "@/pages/api/upsell-native/upsell-payment/[offer_uuid]";
import { cn } from "@/shared/libs/cn";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUpsellNativeStorage } from "../../storage";
import { CardPayment } from "./card";
import { PixPayment } from "./pix";

interface iProps {
  open: boolean;
  onClose: VoidFunction;
}

export const ModalPayment = ({ open, onClose }: iProps) => {
  const [paymentOption, setPaymentOption] = useState<"credit-card" | "pix">(
    "credit-card",
  );

  const {
    planSelect,
    offerSelectUuid,
    upsellOfferUuid,
    saleItemId,
    set,
  } = useUpsellNativeStorage();

  const { mutate, isPending } = fecthMutation<
    iUpsellNativePaymentBodyResponseType,
    iUpsellNativePaymentBody
  >({
    route: `/upsell-native/upsell-payment/${offerSelectUuid}`,
    method: "post",
    options: {
      mutationKey: ["upsell-card-info", offerSelectUuid, saleItemId],
      onSuccess: (data) => {
        set({
          cardData: data.creditCardData,
          pixData: data.pixData,
        });
      },
      onError: () => {
        toast.error("Erro ao processar transação");
      },
    },
  });

  const requestPaymentInfo = () => {
    if (!saleItemId || !offerSelectUuid) return;

    mutate({
      plan_selected_uuid: planSelect?.uuid ?? null,
      offer_selected_uuid: offerSelectUuid,
      upsell_offer_uuid: upsellOfferUuid,
      sale_item_id: saleItemId,
    });
  };

  useEffect(() => {
    if (!open) return;
    requestPaymentInfo();
     
  }, [open]);

  const isPaying =
    queryClient.isMutating({
      mutationKey: ["upsell-payment-by-card-tokenized"],
    }) > 0 ||
    queryClient.isMutating({
      mutationKey: ["upsell-payment-by-new-card"],
    }) > 0;

  if (isPaying) {
    return <ModalPaymentProcess />;
  }

  return (
    <Dialog modal open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "h-fit max-h-[calc(100vh-100px)] w-full overflow-y-auto",
          isPending && "h-fit",
        )}
      >
        <DialogTitle className="text-[#020246]">Pagamento</DialogTitle>

        {isPending && (
          <div className="flex h-full min-h-48 items-center justify-center">
            <AiOutlineLoading3Quarters size={30} className="animate-spin" />
          </div>
        )}

        {!isPending && (
          <main className="flex flex-col gap-2">
            <PaymentOption
              paymentType={paymentOption}
              onSelect={(option) => {
                setPaymentOption(option);
              }}
            />
            {paymentOption === "credit-card" && <CardPayment />}
            {paymentOption === "pix" && <PixPayment />}
          </main>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface iPaymenOptionProps {
  paymentType: "credit-card" | "pix";
  onSelect: (option: "credit-card" | "pix") => void;
}

const PaymentOption = ({ paymentType, onSelect }: iPaymenOptionProps) => {
  const { cardData, pixData } = useUpsellNativeStorage();

  return (
    <div className="flex flex-wrap gap-2">
      {cardData && (
        <PaymentOption.Item
          icon={<GoCreditCard />}
          type="credit-card"
          paymentType={paymentType}
          label="Cartão de crédito"
          discount={cardData.originalPrice - cardData.price}
          price={cardData.price}
          onClick={() => onSelect("credit-card")}
        />
      )}
      {pixData && (
        <PaymentOption.Item
          icon={<MdPix size={17} />}
          label="Pix"
          type="pix"
          paymentType={paymentType}
          discount={pixData.originalPrice - pixData.price}
          price={pixData.price}
          onClick={() => onSelect("pix")}
        />
      )}
    </div>
  );
};

interface iItemProps {
  icon: React.ReactNode;
  label: string;
  price: number;
  discount: number;
  paymentType: "pix" | "credit-card";
  type: "pix" | "credit-card";
  onClick: VoidFunction;
}

PaymentOption.Item = ({
  icon,
  paymentType,
  type,
  label,
  price,
  discount,
  onClick,
}: iItemProps) => {
  return (
    <button
      type="button"
      className="flex w-full flex-col gap-0.5 rounded-[4px] border p-2.5 py-2 min-[800px]:gap-1"
      onClick={onClick}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-1.5 text-[0.875rem] font-medium">
          {icon}
          {label}
        </div>
        <input
          type="checkbox"
          checked={paymentType === type}
          readOnly
        />
      </div>

      <span className="flex gap-1 text-[0.875rem] min-[800px]:text-[0.775rem]">
        <span className="font-medium">Total:</span>
        {price.toLocaleString("pt-br", {
          currency: "BRL",
          style: "currency",
        })}
      </span>

      {discount > 0 && (
        <span className="block w-fit rounded-[4px] bg-[#0f1b35] px-1.5 py-0.5 text-[0.675rem] text-white">
          Economize{" "}
          {discount.toLocaleString("pt-br", {
            currency: "BRL",
            style: "currency",
          })}
        </span>
      )}
    </button>
  );
};