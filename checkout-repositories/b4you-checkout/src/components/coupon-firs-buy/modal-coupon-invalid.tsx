import Image from "next/image";
import { useOfferData } from "@/hooks/states/useOfferData";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

interface iProps {
  isOpen: boolean;
  onTryAgain: VoidFunction;
  onKeepWithoutCoupon: VoidFunction;
}

export function ModalInvalidCouponApplication(props: iProps) {
  const { offerData } = useOfferData();

  const { isOpen, onTryAgain, onKeepWithoutCoupon } = props;

  if (!offerData) return <></>;

  return (
    <Dialog open={isOpen}>
      <DialogContent
        isBtnClose={false}
        className="flex flex-col gap-6 sm:max-w-[400px]"
      >
        <DialogTitle />
        <div className="flex flex-col items-center justify-center gap-2.5">
          <Image
            src="/coupon-error.png"
            width={70}
            height={70}
            quality={100}
            alt=""
          />
          <p className="flex justify-center text-center text-[1rem]">
            Não foi possível gerar o cupom agora. Deseja tentar novamente?
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            className="cursor-pointer"
            style={{
              backgroundColor: offerData.checkout.hex_color,
            }}
            type="button"
            onClick={onTryAgain}
          >
            Tentar novamente
          </Button>
          <Button
            className="cursor-pointer"
            style={{
              borderColor: offerData.checkout.hex_color,
              color: offerData.checkout.hex_color,
            }}
            variant={"outline"}
            type="button"
            onClick={onKeepWithoutCoupon}
          >
            Continuar sem cupom
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
