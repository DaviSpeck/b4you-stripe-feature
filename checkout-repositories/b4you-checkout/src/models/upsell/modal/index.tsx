import { useIsMutating } from "@tanstack/react-query";
import { BtnOptions } from "./btn-options";
import { CreditCard } from "./credit-card";
import { ModalPaymentProcess } from "./credit-card/modal-process";
import { Pix } from "./pix";
import { upsellStorage } from "./storage";

interface iProps {
  isOpen: boolean;
}

export function ModalUpsell(props: iProps) {
  const { isOpen } = props;

  const { paymentSelect } = upsellStorage();

  const isCreditCardPeading = Boolean(
    useIsMutating({ mutationKey: ["upsell-payment-by-card-tokenized"] }),
  );

  if (!isOpen) return <></>;

  if (isCreditCardPeading) {
    return <ModalPaymentProcess />;
  }

  return (
    <div className="flex h-[100vh] w-full items-center justify-center">
      <div className="w-[700px] overflow-y-auto">
        <main className="flex h-full flex-col gap-4 p-4 pt-0">
          <BtnOptions />
          <div className="flex h-full flex-col overflow-y-auto">
            {paymentSelect === "CARD" && <CreditCard isOpen={isOpen} />}
            {paymentSelect === "PIX" && <Pix />}
          </div>
        </main>
      </div>
    </div>
  );
}
