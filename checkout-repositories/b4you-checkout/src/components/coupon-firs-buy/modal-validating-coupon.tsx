import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

interface iProps {
  isOpen: boolean;
}

export function ModalValidatingCoupon(props: iProps) {
  const { isOpen } = props;

  return (
    <Dialog open={isOpen}>
      <DialogContent
        isBtnClose={false}
        className="flex flex-col gap-6 sm:max-w-[400px]"
      >
        <DialogTitle />
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/gift-card-validating.gif"
            width={80}
            height={80}
            quality={100}
            alt=""
          />
          <p className="flex justify-center text-center text-[1rem]">
            Por favor, aguarde. Estamos gerando um cupom de primeira compra...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
