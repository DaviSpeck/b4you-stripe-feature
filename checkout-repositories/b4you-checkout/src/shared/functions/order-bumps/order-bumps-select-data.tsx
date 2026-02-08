import { iOffer } from "@/interfaces/offer";

type ParamsType = {
  offerData: iOffer;
  orderBumpsSelected: string[];
};

type ResponseType = {
  image: string;
  productName: string;
  description: string | null;
  price: number;
  amount: number;
  type: "checkbox" | "amount";
};

export function orderBumpsArr(params: ParamsType): ResponseType[] {
  const { offerData, orderBumpsSelected } = params;

  const orderBumpsSelectedData = offerData.order_bumps.filter((order) =>
    orderBumpsSelected.includes(order.uuid),
  );

  return orderBumpsSelectedData.map((order) => {
    const image = order.alternative_image ?? order.product.cover;

    const orderBumpsAmount = orderBumpsSelected.filter(
      (obUuid) => order.uuid === obUuid,
    ).length;

    return {
      image,
      productName: order.product.name,
      amount: orderBumpsAmount,
      description: order.description,
      price: order.price,
      type: order.show_quantity ? "amount" : "checkbox",
    };
  });
}
