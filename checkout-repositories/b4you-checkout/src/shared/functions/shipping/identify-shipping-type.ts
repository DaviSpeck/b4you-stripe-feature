import { iOffer, ShippingByRegion } from "@/interfaces/offer";

export type ShippingType = "FRENET" | "REGION" | "FIX" | "FREE";

function hasRegionShipping(regions: ShippingByRegion): boolean {
  return Object.values(regions).some(
    (value) => typeof value === "number" && value > 0
  );
}

export function findShippingType(
  { offerData }: { offerData: iOffer | null }
): ShippingType {
  if (!offerData) return "FIX";

  if (offerData.has_frenet) return "FRENET";

  if (offerData.shipping_type === 0) return "FREE";

  if (hasRegionShipping(offerData.shipping_by_region)) {
    return "REGION";
  }

  return "FIX";
}

export function hasAnyShippingOption({
  shippingType,
  shippingPrice,
  shippingFree,
  isShippingFree,
}: {
  shippingType: ShippingType;
  shippingPrice: number | null;
  shippingFree: boolean;
  isShippingFree: boolean;
}) {
  if (shippingType === "FREE") return true;

  if (shippingFree || isShippingFree) return true;

  if (shippingType === "FIX" && shippingPrice !== null) return true;

  if (shippingType === "REGION" && shippingPrice !== null) return true;

  if (shippingType === "FRENET") return true;

  return false;
}