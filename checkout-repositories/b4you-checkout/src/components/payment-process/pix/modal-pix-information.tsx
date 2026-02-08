import Image from "next/image";
import { BiCopy } from "react-icons/bi";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { paymentPixResponse } from "@/pages/api/payment/pix";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { paymentStageType } from "./interface";

interface iModalPixInformation {
  paymentStage: paymentStageType | null;
  pixData: paymentPixResponse | null;
  onClose?: VoidFunction;
  onSucess?: VoidFunction;
}

export function ModalPixInformation(props: iModalPixInformation) {
  const { paymentStage, pixData, onClose } = props;

  const isOpen = paymentStage === "sucess" ? true : false;

  return (
    <Dialog modal={true} open={isOpen}>
      <DialogContent
        isBtnClose={false}
        className="flex h-full max-h-[calc(100vh-30px)] max-w-[700px] flex-col gap-4 overflow-y-auto max-[640px]:h-[100vh] max-[640px]:max-h-none max-[640px]:w-full max-[640px]:rounded-none"
      >
        <DialogTitle />
        <div className="flex items-center justify-between border-b-2 pb-4">
          <p className="text-[0.875rem] font-semibold">
            Valor do pedido:{" "}
            <span className="text-[#07bc0c]">
              {pixData &&
                pixData.price.toLocaleString("pt-br", {
                  style: "currency",
                  currency: "BRL",
                })}
            </span>
          </p>
          <Image
            src="/logo-pix.png"
            width={90}
            height={90}
            quality={100}
            alt=""
          />
        </div>
        <ModalPixInformation.CopyCode code={pixData?.pix_code ?? null} />
        <ModalPixInformation.QrCode QrCodeUrl={pixData?.qrcode ?? null} />
        <footer className="flex flex-col items-center justify-center gap-4">
          <Button className="cursor-pointer" onClick={onClose}>
            Escolher outra forma de pagamento
          </Button>
          <p className="text-center text-[0.875rem] text-[#28a745]">
            Após o pagamento, você receberá um email com a confirmação da sua
            compra
          </p>
          <Image
            src="/logo-horizontal.png"
            width={70}
            height={70}
            alt=""
            quality={70}
          />
        </footer>
      </DialogContent>
    </Dialog>
  );
}

interface iCopyCodeParams {
  code: string | null;
}

ModalPixInformation.CopyCode = function (props: iCopyCodeParams) {
  const { code } = props;

  const informationPaymentWithCode: { stepNumber: number; text: string }[] = [
    {
      stepNumber: 1,
      text: "Copie o código abaixo",
    },
    {
      stepNumber: 2,
      text: "Selecione a opção pagar com PIX e Ler QRCode",
    },
    {
      stepNumber: 3,
      text: "Leia o QRCode e confirme o pagamento",
    },
  ];

  function handleCopy() {
    navigator.clipboard.writeText(code!).then(() =>
      toast.success("código copiado!", {
        position: "top-center",
        style: { textAlign: "center" },
      }),
    );
  }

  return (
    <div className="flex flex-col gap-4 border-b-2 pb-6">
      <ul className="flex flex-col gap-4">
        {informationPaymentWithCode.map(({ stepNumber, text }) => (
          <li key={uuid()} className="flex gap-1.5">
            <span className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#5cead3] text-[0.875rem] font-semibold">
              {stepNumber}
            </span>
            <span className="text-[0.875rem] font-medium">{text}</span>
          </li>
        ))}
      </ul>
      <div className="w-full">
        <input
          className="w-full rounded-t-[8px] border bg-gray-100 px-1 py-2 outline-0"
          type="text"
          value={code ?? ""}
        />
        <Button
          onClick={handleCopy}
          onTouchStart={handleCopy}
          className="w-full cursor-pointer rounded-t-none bg-[#28a745] hover:bg-[#28a746c7]"
        >
          <BiCopy />
          Copiar código (Pix Copia e Cola)
        </Button>
      </div>
    </div>
  );
};

interface iQrCodeProps {
  QrCodeUrl: string | null;
}

ModalPixInformation.QrCode = function (props: iQrCodeProps) {
  const { QrCodeUrl } = props;

  const informationPaymentWithQrCode: { stepNumber: number; text: string }[] = [
    {
      stepNumber: 1,
      text: "Abra o aplicativo do seu banco no celular",
    },
    {
      stepNumber: 2,
      text: "Selecione a opção pagar com PIX e Ler QRCode",
    },
    {
      stepNumber: 3,
      text: "Leia o QRCode e confirme o pagamento",
    },
  ];

  return (
    <div>
      <h2 className="font pb-4 text-center text-[1rem] font-bold">
        Você também pode ler o QRCode abaixo
      </h2>
      <ul className="flex flex-col gap-4">
        {informationPaymentWithQrCode.map(({ stepNumber, text }) => (
          <li key={uuid()} className="flex gap-1.5">
            <span className="flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#5cead3] text-[0.875rem] font-semibold">
              {stepNumber}
            </span>
            <span className="text-[0.875rem] font-medium">{text}</span>
          </li>
        ))}
      </ul>
      <div className="w flex justify-center">
        <img src={QrCodeUrl ?? undefined} />
      </div>
      <div className="flex justify-center py-2">
        <div className="flex items-center gap-1">
          <Image src="/loading.gif" width={20} height={20} alt="" />
          <span className="font-normal text-[#666]">
            Aguardando pagamento...
          </span>
        </div>
      </div>
    </div>
  );
};
