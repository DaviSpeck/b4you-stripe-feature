import { useEffect } from "react";
import { BiCopy, BiPrinter } from "react-icons/bi";
import { IoMdClose } from "react-icons/io";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BankSlipDataType, PaymentStageType } from "./interface";

interface iModelBankSlipInformationProps {
  paymentStage: PaymentStageType;
  bankSlipData: BankSlipDataType;
  onClose?: VoidFunction;
  onSucess?: VoidFunction;
}

export function ModalBankSlipInformation(
  props: iModelBankSlipInformationProps,
) {
  const { onClose, bankSlipData, paymentStage, onSucess } = props;

  const isOpen = paymentStage === "created-code" ? true : false;

  useEffect(() => {
    if (!bankSlipData) return;
    onSucess && onSucess();
  }, [bankSlipData]);

  return (
    <Dialog
      modal={true}
      open={isOpen}
      onOpenChange={() => onClose && onClose()}
    >
      <DialogContent
        isBtnClose={false}
        className="flex max-w-[700px] flex-col gap-6 max-[440px]:h-[100vh] max-[440px]:w-full max-[440px]:rounded-none"
      >
        <DialogTitle className="flex justify-between border-b pb-4">
          Pagamento com Boleto Bancário
          <button onClick={onClose} onTouchStart={onClose}>
            <IoMdClose size={25} />
          </button>
        </DialogTitle>
        <div>
          <div className="flex justify-between px-1.5">
            <div className="flex flex-col items-center">
              <span className="block text-[0.875rem]">VALOR</span>
              <span className="block text-[1.5rem] font-normal">
                {bankSlipData.amount.toLocaleString("pt-br", {
                  currency: "BRL",
                  style: "currency",
                })}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="block text-[0.875rem]">VENCIMENTO</span>
              <span className="block text-[1.5rem] font-normal">
                {bankSlipData.due}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 py-4">
            <ModalBankSlipInformation.Barcode
              code={bankSlipData.line_code}
              codeUrl={bankSlipData.bar_code}
            />
            <div className="flex flex-wrap justify-between gap-2 pb-2 min-[420px]:gap-3">
              <ModalBankSlipInformation.Print bankSlipUrl={bankSlipData.url} />
              <ModalBankSlipInformation.Copy code={bankSlipData.line_code} />
            </div>
          </div>
          <div className="flex flex-col gap-2 px-1.5 pb-4">
            <h2 className="p-0 text-[0.875rem] font-bold text-[#999] uppercase">
              Instruções
            </h2>
            <ul className="flex flex-col gap-2">
              <li className="list-inside list-disc text-[0.875rem] text-[#212529]">
                Você acaba de receber este boleto em seu e-mail.
              </li>
              <li className="list-inside list-disc text-[0.875rem] text-[#212529]">
                Pagamentos com Boleto Bancário levam até 3 dias úteis para serem
                compensados e então terem os produtos liberados.
              </li>
              <li className="list-inside list-disc text-[0.875rem] text-[#212529]">
                Atente-se ao vencimento do boleto. Você pode pagar o boleto em
                qualquer banco ou casa lotérica até o dia do vencimento.
              </li>
              <li className="list-inside list-disc text-[0.875rem] text-[#212529]">
                Depois do pagamento, verifique seu e-mail para receber os dados
                de acesso ao produto (verifique também a caixa de SPAM).
              </li>
              <li className="list-inside list-disc text-[0.875rem] text-[#212529]">
                <span className="font-bold">
                  Quer receber acesso instantâneo à seu produto?
                </span>{" "}
                Escolha pagamento por cartão de crédito ou pix
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface iPrint {
  bankSlipUrl: string;
}

ModalBankSlipInformation.Print = function (props: iPrint) {
  const { bankSlipUrl } = props;

  function handleClick() {
    fetch(bankSlipUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        iframe.src = blobUrl;

        iframe.onload = () => {
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();

            setTimeout(() => {
              document.body.removeChild(iframe);
              URL.revokeObjectURL(blobUrl);
            }, 1000);
          }, 500);
        };

        document.body.appendChild(iframe);
      })
      .catch(() => {});
  }

  return (
    <Button
      onClick={handleClick}
      className="cursor-pointer rounded-[4px] bg-[#007bff] text-white max-[421px]:w-full"
    >
      <BiPrinter />
      Imprimir Boleto
    </Button>
  );
};

interface iCopy {
  code: string;
}

ModalBankSlipInformation.Copy = function (props: iCopy) {
  const { code } = props;

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() =>
      toast.success("código copiado!", {
        position: "top-center",
        style: { textAlign: "center" },
      }),
    );
  }

  return (
    <Button
      onClick={handleCopy}
      className="cursor-pointer rounded-[4px] bg-[#007bff] text-white max-[421px]:w-full"
    >
      <BiCopy />
      Copiar linha digitável
    </Button>
  );
};

interface iBarcode {
  code: string;
  codeUrl: string;
}

ModalBankSlipInformation.Barcode = function (props: iBarcode) {
  const { code, codeUrl } = props;

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() =>
      toast.success("código copiado!", {
        position: "top-center",
        style: { textAlign: "center" },
      }),
    );
  }

  function formatarLinhaDigitavel(linha: string): string {
    const apenasNumeros = linha.replace(/\D/g, "");

    return [
      apenasNumeros.slice(0, 5) + "." + apenasNumeros.slice(5, 10),
      apenasNumeros.slice(10, 15) + "." + apenasNumeros.slice(15, 21),
      apenasNumeros.slice(21, 26) + "." + apenasNumeros.slice(26, 32),
      apenasNumeros.slice(32, 33),
      apenasNumeros.slice(33, 47),
    ].join(" ");
  }

  return (
    <div className="flex flex-col rounded-[4px] border-2 p-2 px-2">
      <img src={codeUrl} />
      <span
        onTouchStart={handleCopy}
        className="block text-center text-[1.2rem] font-medium sm:text-[1rem] sm:font-normal"
      >
        {formatarLinhaDigitavel(code)}
      </span>
    </div>
  );
};
