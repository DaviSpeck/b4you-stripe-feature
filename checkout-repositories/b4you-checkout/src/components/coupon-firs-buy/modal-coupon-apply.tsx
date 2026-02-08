import Image from "next/image";
import { useEffect } from "react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iCoupon } from "@/interfaces/coupon";
import { queryClient } from "@/pages/_app";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

interface iProps {
  isOpen: boolean;
  onAccept: VoidFunction;
  onRefuse: VoidFunction;
}

export function ModalCouponApply(props: iProps) {
  const { offerData } = useOfferData();
  const { offerPrice } = useOfferPayment();

  const { isOpen, onAccept, onRefuse } = props;

  const coupon = queryClient.getQueryData(["coupon-first-buy"]) as iCoupon;

  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen]);

  if (!offerData || !coupon) return <></>;

  return (
    <Dialog open={isOpen}>
      <DialogContent
        isBtnClose={false}
        className="flex flex-col gap-4 sm:max-w-[400px]"
      >
        <DialogTitle />
        <div className="flex flex-col items-center justify-center gap-2.5">
          <Image
            src="/gift-card.gif"
            width={120}
            height={120}
            quality={100}
            alt=""
          />
          <div className="flex flex-col items-center justify-center gap-0.5">
            <p className="flex justify-center text-center text-[1rem]">
              Você ganhou{" "}
              {coupon.percentage > 0 ? (
                <span className="px-1 font-semibold">
                  {coupon.percentage}% OFF
                </span>
              ) : (
                <span className="px-1 font-semibold">
                  {coupon.amount.toLocaleString("pt-br", {
                    currency: "BRL",
                    style: "currency",
                  })}{" "}
                  OFF
                </span>
              )}{" "}
              para usar agora.
            </p>
            <p>
              <span className="font-semibold">De:</span>{" "}
              {offerPrice?.toLocaleString("pt-br", {
                currency: "BRL",
                style: "currency",
              })}
              <span className="px-2 font-semibold">{">"}</span>
              <span className="font-semibold">Por:</span>{" "}
              {coupon.percentage > 0 && offerPrice
                ? (
                    offerPrice *
                    ((100 - coupon.percentage) / 100)
                  ).toLocaleString("pt-br", {
                    currency: "BRL",
                    style: "currency",
                  })
                : ((offerPrice ?? 0) - coupon.amount).toLocaleString("pt-br", {
                    currency: "BRL",
                    style: "currency",
                  })}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            className="cursor-pointer"
            style={{
              backgroundColor: offerData.checkout.hex_color,
            }}
            type="button"
            onClick={onAccept}
          >
            Sim, quero o desconto
          </Button>
          <Button
            className="cursor-pointer"
            style={{
              borderColor: offerData.checkout.hex_color,
              color: offerData.checkout.hex_color,
            }}
            variant={"outline"}
            type="button"
            onClick={onRefuse}
          >
            Não, obrigado
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
