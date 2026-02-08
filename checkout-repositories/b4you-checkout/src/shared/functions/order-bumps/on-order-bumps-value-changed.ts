import { iOffer } from "@/interfaces/offer";
import { OnValueChangeParamsType } from "@/models/checkout-variants/single/form/order-bumps";

type ParamsType = OnValueChangeParamsType & {
  offerData: iOffer;
  orderBumpsSelected: string[];
};

export function onOrderBumpsValueChange(params: ParamsType): string[] {
  const { newValue, orderBumpId, offerData, orderBumpsSelected } = params;

  if (!offerData) return [];

  const orderBumpsSelect = Array.from({ length: newValue }, () => orderBumpId);

  const orderBumpsWithOutOrderSelect = orderBumpsSelected.filter(
    (orderUuid) => orderUuid !== orderBumpId,
  );

  const orderBumpsArr = orderBumpsWithOutOrderSelect.concat(orderBumpsSelect);

  return orderBumpsArr;
}
