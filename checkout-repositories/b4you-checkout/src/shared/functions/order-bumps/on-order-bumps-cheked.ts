import { OnCheckParamsType } from "@/models/checkout-variants/single/form/order-bumps";

type ParamsType = { orderBumpsSelected: string[] } & OnCheckParamsType;

export function onOrderBumpsCheckedChange(params: ParamsType): string[] {
  const { isChecked, orderBumpId, orderBumpsSelected } = params;

  const orderBumpsWithOutOrderSelect = orderBumpsSelected.filter(
    (orderUuid) => orderUuid !== orderBumpId,
  );

  if (!isChecked) {
    return orderBumpsWithOutOrderSelect;
  }

  return orderBumpsSelected.concat([orderBumpId]);
}
