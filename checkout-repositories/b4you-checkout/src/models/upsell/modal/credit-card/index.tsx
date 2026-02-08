import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "sonner";
import { fecthMutation } from "@/utils/fetch";
import { iUpsellCardType } from "@/interfaces/upsell";
import { queryClient } from "@/pages/_app";
import { upsellStorage } from "../storage";
import { CurrentCreditCard } from "./current-card";
import { NewCreditCard } from "./new-card";

type optionSelectType = "currentCard" | "newCard";

type bodyType = { offer_id: string; sale_item_id: string };

interface iProps {
  isOpen: boolean;
}

export function CreditCard(props: iProps) {
  const [option, setOption] = useState<optionSelectType>("currentCard");

  const { isOpen } = props;

  const { cardData } = upsellStorage();

  const params: { sale_item: string; upsell_offer: string } = useParams();

  const { mutate, data, isPending } = fecthMutation<iUpsellCardType, bodyType>({
    route: "/sale-information/upsell/card-info",
    method: "post",
    options: {
      mutationKey: ["upsell-card-info"],
      onSuccess: (data) => {
        queryClient.setQueryData(["upsell-card-info"], data);
        upsellStorage.setState({ cardData: data });
      },
      onError: () => {
        toast.error("Erro ao processar trasação");
      },
    },
  });

  const creditCardData = queryClient.getQueryData(["upsell-card-info"]);

  function initialPayment() {
    if (cardData!.allowed_payment_methods.includes("card")) {
      upsellStorage.setState({ paymentSelect: "CARD" });
      return;
    }
    if (cardData!.allowed_payment_methods.includes("pix")) {
      upsellStorage.setState({ paymentSelect: "PIX" });
      return;
    }
  }

  useEffect(() => {
    if (data || !isOpen || creditCardData) return;
    mutate({
      offer_id: params.upsell_offer,
      sale_item_id: params.sale_item,
    });
  }, [isOpen]);

  useEffect(() => {
    if (!cardData) return;
    initialPayment();
  }, [cardData]);

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <AiOutlineLoading3Quarters size={40} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {cardData?.card.last_four_digits && <CurrentCreditCard
        isSelected={option === "currentCard"}
        onClick={() => setOption("currentCard")}
      />}
      <NewCreditCard
        isSelected={option === "newCard"}
        onClick={() => setOption("newCard")}
      />
    </div>
  );
}
