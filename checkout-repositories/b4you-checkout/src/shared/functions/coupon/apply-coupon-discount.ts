import { CalcCouponDiscount } from "./calc-coupon-discount";

type ApplyCouponParamsType = {
  couponValue: number;
  discountType: "percent" | "cashback";
  offerPrice: number;
  offerShippingPrice: number | null;
};

export function AppyCoupon(params: ApplyCouponParamsType) {
  const { discountType, couponValue, offerPrice } = params;

  const offerWithDiscont = CalcCouponDiscount({
    couponValue,
    discountType,
    priceToApplyDiscount: offerPrice,
  });

  const offerWithDiscountCurrency = offerWithDiscont.toLocaleString("pt-br", {
    currency: "BRL",
    style: "currency",
  });

  return {
    offerWithDiscountPrice: offerWithDiscont,
    offerWithDiscountCurrency,
  };
}
