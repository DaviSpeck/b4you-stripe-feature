import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { paymentStageType } from "./interface";

const isReviewCreditCardData = ["1011", "1045", "1068", "1069", "1070"];

const isFraud = [
  "1003",
  "1002",
  "1004",
  "1005",
  "1006",
  "1007",
  "1008",
  "1022",
  "1024",
  "1025",
  "1029",
  "1030",
  "1032",
  "0001",
  "0002",
  "0003",
  "0004",
  "0005",
  "0006",
  "0007",
  "0008",
  "0009",
  "0051",
  "0052",
  "0053",
  "0054",
  "0055",
  "0056",
];

interface iModalPaymentDenied {
  paymentStage: paymentStageType | null;
  errorCode: string | null;
  onReview?: VoidFunction;
  onPixGenerate?: VoidFunction;
  onAddNewCard?: VoidFunction;
}

export function ModalPaymentDenied(props: iModalPaymentDenied) {
  const { onReview, paymentStage, errorCode, onAddNewCard, onPixGenerate } =
    props;

  const isOpen = paymentStage === "denied" ? true : false;
  const isErrorFraud = isFraud.includes(String(errorCode));
  const isErrorCardReview = isReviewCreditCardData.includes(String(errorCode));

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => open && onReview && onReview()}
    >
      <DialogContent
        isBtnClose={false}
        className="flex flex-col gap-6 sm:max-w-[500px]"
      >
        <DialogTitle />
        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-center justify-center gap-2">
            <Image
              src="/credit-card-denied.png"
              width={80}
              height={80}
              quality={100}
              alt=""
            />
            <h2 className="p-0 text-center text-[1rem] font-medium text-[#B30000] max-[450px]:text-center">
              Não foi possível processar o pagamento!
            </h2>
          </div>
          <span className="flex justify-center text-center text-[1rem] font-normal max-[450px]:text-center">
            {isErrorFraud &&
              "Entre em contato com o nosso suporte para mais informações."}
            {isErrorCardReview &&
              "Não foi possível concluir a compra. Verifique os dados do cartão e tente novamente."}
            {errorCode === "5087" &&
              "Transação não autorizada. Limite diário excedido."}
            {errorCode === "1016" && "Saldo insuficiente"}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex w-full flex-col gap-2 px-12">
            {!isErrorFraud && (
              <Button
                className="w-full cursor-pointer"
                onClick={() => {
                  onReview?.();
                  onPixGenerate?.();
                }}
              >
                Gerar Pix
              </Button>
            )}
            {isErrorFraud && (
              <Button className="w-full cursor-pointer" onClick={onAddNewCard}>
                Entrar em contato com o suporte
              </Button>
            )}
            {isErrorFraud &&
              !isErrorCardReview &&
              (errorCode === "1016" || errorCode === "5087") && (
                <Button
                  className="w-full cursor-pointer"
                  onClick={onAddNewCard}
                >
                  Tentar com outro cartão
                </Button>
              )}
            <Button className="w-full cursor-pointer" onClick={onReview}>
              Revisar dados
            </Button>
          </div>
          {!isErrorFraud && (
            <p className="text-[0.75rem] font-medium max-[450px]:text-center">
              Se o problema persistir,{" "}
              <a
                href=""
                className="text-[#0B4CC4] underline underline-offset-2"
              >
                entre em contato com nossa equipe de suporte
              </a>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
