import { iOffer } from "@/interfaces/offer";

type ParamsType = {
  orderBumps: string[] | null;
  offerData: iOffer | null;
};

export function isPhysicalProduct(params: ParamsType): boolean {
  const { offerData, orderBumps } = params;

  if (!offerData) return false;
  if (!orderBumps) return false;

  if (offerData.product.content_delivery === "physical") {
    return true;
  }

  const ordersBumopsDataArr = offerData.order_bumps.filter((order) =>
    orderBumps.includes(order.uuid),
  );

  return ordersBumopsDataArr.some(
    (order) => order.product.content_delivery === "physical",
  );
}
