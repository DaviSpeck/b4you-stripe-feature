import Cookies from "js-cookie";
import Image from "next/image";
import { useRouter } from "next/router";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiCopy } from "react-icons/bi";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { fecthMutation, fecthRead } from "@/utils/fetch";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { usePixelStates } from "@/hooks/states/usePixel";
import { iOffer } from "@/interfaces/offer";
import { iPixSaleData } from "@/interfaces/sale-data";
import { Button } from "@/components/ui/button";
import { SuccessPayment } from "./success-payment";

interface iProps {
  offerData: iOffer;
}

export function PixPaymentPage(props: iProps) {
  const [price, setPrice] = useState<number>(0);
  const [pixCode, setPixCode] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");

  const hasRedirectedRef = useRef(false);

  const [searchParams] = useQueryStates({
    sale_id: parseAsString.withDefault(""),
  });

  const saleId = searchParams.sale_id;

  const { offerData } = props;

  const { set: setOfferData } = useOfferData();
  const { set, isPaid } = useOfferPayment();
  const { set: setPixelStates } = usePixelStates();

  const router = useRouter();

  const { data, isFetching: isLoadingPixData } = fecthRead<iPixSaleData>({
    queryKey: ["pix-info", saleId],
    route: `/payment/pix/get-pix-information/${saleId}`,
    options: {
      enabled: Boolean(saleId) && !Boolean(pixCode),
    },
  });

  const { mutate } = fecthMutation<
    { status: "confirmed" | "expired" | "peading" },
    { sale_id: string }
  >({
    method: "post",
    route: "/payment/pix/payment-check-status",
    options: {
      onSuccess(data) {
        if (data.status === "expired") {
          router.back();
          return;
        }

        if (
          data.status === "confirmed" &&
          !isPaid &&
          !hasRedirectedRef.current
        ) {
          hasRedirectedRef.current = true;

          set({ isPaid: true });

          const isPaidAlready = Cookies.get("event-on-generate-paid");
          !isPaidAlready && setPixelStates({ isPaid: true });

          const context = JSON.parse(
            localStorage.getItem("pixSaleContext") || "{}",
          );

          setTimeout(() => {
            if (context.isNativeUpsell) {
              router.replace(`/upsell-native/${context.offerId}/${context.saleId}`);
              return;
            }

            if (context.upsellUrl) {
              router.replace(context.upsellUrl);
              return;
            }

            router.replace(`/payment-thanks/${context.saleId}`);
          }, 1500);
        }
      },
    },
  });

  useEffect(() => {
    if (!saleId || isPaid) return;

    const interval = setInterval(() => {
      mutate({ sale_id: saleId });
    }, 15000);

    return () => clearInterval(interval);
  }, [saleId, isPaid, mutate]);

  useEffect(() => {
    if (!offerData) return;
    setOfferData(offerData);
  }, [offerData, setOfferData]);

  useEffect(() => {
    if (!data) return;
    setPrice(data.price);
    setPixCode(data.pix_code);
    setQrCode(data.qrcode);
  }, [data]);

  if (isLoadingPixData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <AiOutlineLoading3Quarters size={40} className="animate-spin" />
      </div>
    );
  }

  return (
    <main className="relative flex h-full flex-col items-center justify-center gap-10 overflow-y-auto p-10">
      {isPaid && <SuccessPayment />}
      {!isPaid && (
        <>
          <div className="max-w-[600px] p-4">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b-2 pb-4">
                <p className="text-[0.875rem] font-semibold">
                  Valor do pedido:{" "}
                  <span className="text-[#07bc0c]">
                    {price.toLocaleString("pt-br", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </p>
                <Image src="/logo-pix.png" width={90} height={90} alt="" />
              </div>

              <PixPaymentPage.CopyCode code={pixCode} />
            </div>

            <PixPaymentPage.QrCode QrCodeUrl={qrCode} />
          </div>
        </>
      )}
    </main>
  );
}

interface iCopyCodeParams {
  code: string | null;
}

PixPaymentPage.CopyCode = function (props: iCopyCodeParams) {
  const { code } = props;

  const informationPaymentWithCode: { stepNumber: number; text: string }[] = [
    { stepNumber: 1, text: "Copie o código abaixo" },
    { stepNumber: 2, text: "Selecione a opção pagar com PIX e Ler QRCode" },
    { stepNumber: 3, text: "Leia o QRCode e confirme o pagamento" },
  ];

  function handleCopy() {
    if (!code) return;

    navigator.clipboard.writeText(code).then(() =>
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
          readOnly
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

PixPaymentPage.QrCode = function (props: iQrCodeProps) {
  const { QrCodeUrl } = props;

  const informationPaymentWithQrCode: { stepNumber: number; text: string }[] = [
    { stepNumber: 1, text: "Abra o aplicativo do seu banco no celular" },
    { stepNumber: 2, text: "Selecione a opção pagar com PIX e Ler QRCode" },
    { stepNumber: 3, text: "Leia o QRCode e confirme o pagamento" },
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