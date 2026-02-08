import { useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiSolidCheckCircle } from "react-icons/bi";
import { SaleContext } from "@/interfaces/sale-context";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { paymentCreditCardDataType, paymentStageType } from "./interface";

interface iModalPaymentSucess {
  paymentStage: paymentStageType | null;
  saleContext: SaleContext | null;
  paymentInformations: paymentCreditCardDataType | null;
}

declare global {
  interface Window {
    __paymentRedirectTimer?: number;
  }
}

export function ModalPaymentSucess(props: iModalPaymentSucess) {
  const { paymentStage, saleContext } = props;
  const isOpen = paymentStage === "sucess";

  useEffect(() => {
    if (paymentStage !== "sucess") return;
    if (!saleContext?.saleId) return;

    if (window.__paymentRedirectTimer) return;

    const url =
      saleContext.isNativeUpsell
        ? `/upsell-native/${saleContext.offerId}/${saleContext.saleId}`
        : saleContext.upsellUrl
          ? saleContext.upsellUrl
          : `/payment-thanks/${saleContext.saleId}`;

    window.__paymentRedirectTimer = window.setTimeout(() => {
      window.location.assign(url);
    }, 4000);
  }, [paymentStage, saleContext]);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        isBtnClose={false}
        className="flex flex-col gap-6 sm:max-w-[500px]"
      >
        <DialogTitle>Pagamento realizado com sucesso</DialogTitle>
        <DialogDescription>
          Você será redirecionado automaticamente em instantes.
        </DialogDescription>

        <div className="flex flex-col items-center justify-center">
          <BiSolidCheckCircle size={80} color="#00A31E" />
          <h2 className="text-[1rem] font-medium text-[#00A31E]">
            Pagamento realizado com sucesso!
          </h2>
          <span className="text-center text-[1rem] font-normal">
            Parabéns, {props.paymentInformations?.full_name}! Sua compra foi
            realizada com sucesso.
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <span className="block text-[0.75rem] font-medium">
            Não feche essa página, você será redirecionado em instantes
          </span>
          <AiOutlineLoading3Quarters size={16} className="animate-spin" />
        </div>
      </DialogContent>
    </Dialog>
  );
}