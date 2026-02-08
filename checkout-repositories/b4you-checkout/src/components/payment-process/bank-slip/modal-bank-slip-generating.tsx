import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PaymentStageType } from "./interface";

interface iModalBankSlipGenerating {
  paymentStage: PaymentStageType | null;
}

export function ModalBankSlipGenerating(props: iModalBankSlipGenerating) {
  const { paymentStage } = props;

  const isOpen = paymentStage === "peading" ? true : false;

  return (
    <Dialog open={isOpen}>
      <DialogContent isBtnClose={false} className="sm:max-w-[500px]">
        <DialogTitle />
        <div>
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/bill.gif"
              width={80}
              height={80}
              quality={100}
              alt=""
            />
            <span className="flex justify-center text-center text-[1rem] font-normal max-[450px]:text-center">
              Estamos gerando um boleto . Aguarde um momento
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
