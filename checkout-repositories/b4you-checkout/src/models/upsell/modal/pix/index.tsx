import Image from "next/image";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { fecthMutation } from "@/utils/fetch";
import { queryClient } from "@/pages/_app";
import { upsellStorage } from "../storage";
import { QrCodeComponent } from "./qr-code";
import { TimerComponent } from "./timer";

export interface iPixData {
  sale_item_id: string;
  status: string;
  qrcode_url: string;
  qrcode: string;
}

export function Pix() {
  const [isPaid, setIsPaid] = useState<boolean>(false);

  const { paymentSelect } = upsellStorage();

  const router = useRouter();

  const { sale_item, upsell_offer } = useParams<{
    sale_item: string;
    upsell_offer: string;
  }>();

  const pixData = queryClient.getQueryData(["upsell-pix-info"]) as iPixData;

  const { mutate, isPending, data } = fecthMutation<iPixData>({
    method: "post",
    route: "/sale-information/upsell/pix-info",
    options: {
      mutationKey: ["upsell-pix-info"],
      onSuccess: (data) => {
        queryClient.setQueryData(["upsell-pix-info"], data);
      },
    },
  });

  const { mutate: pixStatus } = fecthMutation<
    { status: "confirmed" | "expired" },
    { sale_id: string }
  >({
    method: "post",
    route: "/payment/pix/payment-check-status",
    options: {
      mutationKey: ["pix-status", sale_item],
      onSuccess(data) {
        if (data.status === "confirmed") {
          setIsPaid(true);
        }

        if (data.status === "expired") {
          mutate({
            offer_id: upsell_offer,
            sale_item_id: sale_item,
          });
        }
      },
    },
  });

  useEffect(() => {
    if (!data || isPaid) return;
    setInterval(() => {
      pixStatus({ sale_id: sale_item });
    }, 15 * 1000);
  }, [data]);

  useEffect(() => {
    if (pixData) return;
    if (Boolean(sale_item) && Boolean(upsell_offer)) {
      mutate({
        offer_id: upsell_offer,
        sale_item_id: sale_item,
      });
    }
  }, [paymentSelect]);

  useEffect(() => {
    if (!isPaid) return;
    setTimeout(() => router.replace(`/payment-thanks/${sale_item}`), 2000);
  }, [isPaid]);

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <AiOutlineLoading3Quarters size={40} className="animate-spin" />
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center">
        <Image src={"/shopping-bag.gif"} width={160} height={160} alt="" />
        <h1 className="text-[1.5rem] font-normal">
          Pagamento realizado com sucesso!
        </h1>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2.5">
      <QrCodeComponent />
      <div className="col-span-2 flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-[1.5rem] font-medium text-[#212529]">
            Pagar com Pix
          </h1>
          <ul className="flex list-inside list-disc flex-col gap-2 text-[0.85rem] text-[#505050]">
            <li>Abra o aplicativo do seu banco no celular</li>
            <li>Selecione a opção de pagar com Pix / Escanear QR Code</li>
            <li className="underline underline-offset-2">
              <span className="font-bold">
                Após pagamento, não feche esta página
              </span>
              , aguarde até que o pagamento seja reconhecido.
            </li>
          </ul>
        </div>
        <TimerComponent />
      </div>
    </div>
  );
}
