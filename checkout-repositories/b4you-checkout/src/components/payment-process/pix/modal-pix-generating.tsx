import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { paymentStageType } from "./interface";

interface iModalPixGeneratingProcessingProps {
  paymentStage: paymentStageType | null;
}

export function ModalPixGeneratingProcessing(
  props: iModalPixGeneratingProcessingProps,
) {
  const { paymentStage } = props;

  const isOpen = paymentStage === "peading" ? true : false;

  return (
    <Dialog open={isOpen}>
      <DialogContent isBtnClose={false} className="sm:max-w-[500px]">
        <DialogTitle />
        <div>
          <div className="flex flex-col items-center justify-center">
            <Image
              src="/qr-code.gif"
              width={80}
              height={80}
              quality={100}
              alt=""
            />
            <span className="flex justify-center text-center text-[1rem] font-normal">
              Estamos gerando o seu código pix. Aguarde um momento
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
