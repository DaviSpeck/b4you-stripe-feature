import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "sonner";
import { fecthMutation } from "@/utils/fetch";
import { useUpsellNativeStorage } from "@/models/upsell-native/storage";
import { iUpsellNativePaymentBody } from "@/pages/api/upsell-native/upsell-payment/[offer_uuid]";
import { iUpsellNativePaymentPixBodyResponseType } from "@/pages/api/upsell-native/upsell-payment-pix/[offer_uuid]";
import { QrCodeComponent } from "./qr-code";
import { TimerComponent } from "./timer";

export const PixPayment = () => {
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isPaid, setIsPaid] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMutatingRef = useRef(false);
  const pixStatusRef = useRef<
    ((params: { sale_id: string }) => void) | null
  >(null);

  const router = useRouter();

  const {
    set,
    pixData,
    planSelect,
    offerSelectUuid,
    upsellOfferUuid,
    saleItemId,
  } = useUpsellNativeStorage();

  if (!saleItemId) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <AiOutlineLoading3Quarters size={30} className="animate-spin" />
      </div>
    );
  }

  const canMutate =
    typeof saleItemId === "string" &&
    (typeof offerSelectUuid === "string" ||
      typeof planSelect?.uuid === "string");

  const { mutate, isPending } = fecthMutation<
    iUpsellNativePaymentPixBodyResponseType,
    iUpsellNativePaymentBody
  >({
    route: `/upsell-native/upsell-payment-pix/${offerSelectUuid ?? planSelect?.uuid
      }`,
    method: "post",
    options: {
      mutationKey: ["upsell-card-info", offerSelectUuid, saleItemId],
      onSuccess: ({ pixData }) => {
        set({ pixData });
        isMutatingRef.current = false;
      },
      onError: () => {
        isMutatingRef.current = false;
        toast.error("Erro ao processar trasação");
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
      mutationKey: ["pix-status", saleItemId],
      onSuccess(data) {
        if (data.status === "confirmed") {
          setIsPaid(true);
        }

        if (data.status === "expired" && !isMutatingRef.current && canMutate) {
          isMutatingRef.current = true;

          mutate({
            plan_selected_uuid: planSelect?.uuid || null,
            offer_selected_uuid: offerSelectUuid,
            sale_item_id: saleItemId,
            upsell_offer_uuid: upsellOfferUuid,
          });
        }
      },
    },
  });

  useEffect(() => {
    pixStatusRef.current = pixStatus;
  }, [pixStatus]);

  useEffect(() => {
    if (!pixData || isPaid) return;

    const id =
      pixData?.pixData?.sale_id ??
      pixData?.sale_id ??
      saleItemId;

    if (!id) return;

    intervalRef.current = setInterval(() => {
      pixStatusRef.current?.({ sale_id: id });
    }, 15000);

    return () => clearInterval(intervalRef.current!);
  }, [pixData, isPaid, saleItemId]);

  useEffect(() => {
    if (!isPaid) return;

    const redirect = setTimeout(() => {
      router.replace(`/payment-thanks/${saleItemId}`);
    }, 2000);

    return () => clearTimeout(redirect);
  }, [isPaid, saleItemId]);

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
    <div className="grid grid-cols-1 gap-2.5 min-[800px]:grid-cols-5">
      {Number.isFinite(pixData?.price) && (
        <div className="col-span-1 flex items-center justify-between rounded-[8px] border border-[#e4e7ec] p-3 text-[0.875rem] font-medium min-[800px]:col-span-5">
          <span>Valor do pedido:</span>
          <strong>
            {pixData?.price.toLocaleString("pt-br", {
              currency: "BRL",
              style: "currency",
            })}
          </strong>
        </div>
      )}

      <QrCodeComponent
        timeLeft={timeLeft}
        onNewTimeLeft={() => setTimeLeft(5 * 60)}
      />

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

        <TimerComponent
          timeLeft={timeLeft}
          onSet={(time) => setTimeLeft(time)}
        />
      </div>
    </div>
  );
};