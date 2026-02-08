import Image from "next/image";
import { useOfferData } from "@/hooks/states/useOfferData";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

interface iProps {
  isOpen: boolean;
  onClose: VoidFunction;
}

export function ModalCouponExpired(props: iProps) {
  const { offerData } = useOfferData();

  const { isOpen, onClose } = props;

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
            O cupom de primeira compra não está mais disponível.
          </p>
        </div>
        <Button
          className="cursor-pointer"
          style={{
            backgroundColor: offerData.checkout.hex_color,
          }}
          type="button"
          onClick={onClose}
        >
          Continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
