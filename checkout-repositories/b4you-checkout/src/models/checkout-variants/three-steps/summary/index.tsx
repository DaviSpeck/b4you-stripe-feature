import { useOfferData } from "@/hooks/states/useOfferData";
import { PlanSummary } from "./plan";
import { ProductSummary } from "./product";

export function SummaryOffer() {
  const { offerData } = useOfferData();

  if (offerData && offerData.payment.plans.length > 0) {
    return (
      <div className="relative">
        <PlanSummary />
      </div>
    );
  }

  return (
    <div className="relative min-[1200px]:max-w-[380px]">
      <ProductSummary />
    </div>
  );
}
