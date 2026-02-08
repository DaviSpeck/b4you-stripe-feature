import { useOfferData } from "@/hooks/states/useOfferData";
import { SummaryPlan } from "./plan";
import { SummaryProduct } from "./product";

export function SummaryTotal() {
  const { offerData } = useOfferData();

  if (!offerData) return <></>;

  if (
    Array.isArray(offerData.offerShopify) ||
    offerData.payment.type === "single"
  ) {
    return <SummaryProduct />;
  }

  return <SummaryPlan />;
}
