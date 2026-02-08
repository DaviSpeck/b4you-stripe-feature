import { Dialog } from "@radix-ui/react-dialog";
import Image from "next/image";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";

export function ModalPaymentProcess() {
  return (
    <Dialog open={true}>
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
            <span className="flex justify-center text-center text-[1rem] font-normal">
              Estamos processando sua compra. Aguarde um momento
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
