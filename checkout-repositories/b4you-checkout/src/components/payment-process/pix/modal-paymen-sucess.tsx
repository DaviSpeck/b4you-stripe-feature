import { useRouter } from "next/router";
import { useEffect } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiSolidCheckCircle } from "react-icons/bi";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { paymentPixDataType, paymentStageType } from "./interface";

interface iModalPaymentSucess {
  paymentStage: paymentStageType | null;
  saleId: string | null;
  paymentInformations: paymentPixDataType | null;
}

export function ModalPixPaymentSucess(props: iModalPaymentSucess) {
  const { paymentStage, saleId } = props;
  const isOpen = paymentStage === "sucess" ? true : false;

  const router = useRouter();

  useEffect(() => {
    if (!saleId) return;
    setTimeout(() => router.replace(`/payment-thanks/${saleId}`), 4000);
  }, [saleId]);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        isBtnClose={false}
        className="flex flex-col gap-6 sm:max-w-[500px]"
      >
        <DialogTitle />
        <div>
          <div className="flex flex-col items-center justify-center">
            <BiSolidCheckCircle size={80} color="#00A31E" />
            <h2 className="p-0 text-[1rem] font-medium text-[#00A31E]">
              Pagamento realizada com sucesso!
            </h2>
          </div>
          <span className="flex justify-center text-center text-[1rem] font-normal">
            Parabéns, {props.paymentInformations?.full_name}! Sua compra foi realizada com sucesso.
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="block text-[0.75rem] font-medium">
            Não feche essa página, você será redirecionado em instantes{" "}
          </span>
          <AiOutlineLoading3Quarters size={16} className="block animate-spin" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
