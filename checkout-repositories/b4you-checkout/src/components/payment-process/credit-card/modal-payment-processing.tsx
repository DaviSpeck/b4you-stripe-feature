import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { paymentStageType } from "./interface";

interface iModalPaymentProcessing {
  paymentStage: paymentStageType | null;
}

export function ModalPaymentProcessing(props: iModalPaymentProcessing) {
  const { paymentStage } = props;

  const isOpen = paymentStage === "peading" ? true : false;

  return (
    <Dialog open={isOpen}>
      <DialogContent isBtnClose={false} className="sm:max-w-[500px]">
        <DialogTitle />
        <div>
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/credit-card.gif"
              width={80}
              height={80}
              quality={100}
              alt=""
            />
            <span className="flex justify-center text-center text-[1rem] font-normal max-[450px]:text-center">
              Estamos processando sua compra. Aguarde um momento
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
