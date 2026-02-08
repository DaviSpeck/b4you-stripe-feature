import { iOffer, PaymentTypes } from "@/interfaces/offer";

type ParamsType = {
  offerData: iOffer;
  orderBumpsSelected: string[];
  discountPercent: number;
  paymentSelect: PaymentTypes;
};

type ReturnType = {
  originalPrice: number;
  priceWithDiscount: number | null;
};

export function orderBumpsTotal(params: ParamsType): ReturnType {
  const { orderBumpsSelected, offerData, discountPercent } = params;

  const orderBumpArr = offerData.order_bumps;

  const totalPrice = orderBumpsSelected
    .map((obUuid) => {
      const obSelected = orderBumpArr.find((obData) => obUuid === obData.uuid);

      if (!obSelected) return 0;

      return obSelected.price;
    })
    .reduce((acc, curr) => acc + curr, 0);

  if (discountPercent > 0) {
    return {
      originalPrice: Math.abs(totalPrice),
      priceWithDiscount: Math.abs(totalPrice * ((discountPercent - 100) / 100)),
    };
  }

  return {
    originalPrice: totalPrice,
    priceWithDiscount: null,
  };
}
