import { useEffect } from "react";
import { useOfferPayment } from "@/hooks/states/checkout";
import { useOfferData } from "@/hooks/states/useOfferData";
import { iOffer } from "@/interfaces/offer";
import { ModalUpsell } from "./modal";

interface iProps {
  offer: iOffer;
}

export function UpsellPage(props: iProps) {
  const { offerData, set: setOfferData } = useOfferData();
  const { set: setOfferPayment } = useOfferPayment();

  const { offer } = props;

  useEffect(() => {
    if (!offerData) return;
    setOfferData(offerData);
    setOfferPayment({ paymentSelected: "CARD" });
  }, [offer]);

  return <ModalUpsell isOpen={true} />;
}
