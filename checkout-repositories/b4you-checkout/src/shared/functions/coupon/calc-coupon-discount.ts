type CalcCouponDiscountParamsType = {
  discountType: "cashback" | "percent";
  couponValue: number;
  priceToApplyDiscount: number;
};

export function CalcCouponDiscount(
  params: CalcCouponDiscountParamsType,
): number {
  const { couponValue, discountType, priceToApplyDiscount } = params;

  if (discountType === "percent") {
    const percentForpayment = (100 - couponValue) / 100;
    const priceWithDiscount = priceToApplyDiscount * percentForpayment;
    return priceWithDiscount > 0 ? priceWithDiscount : 0;
  }

  const priceWithDiscount = priceToApplyDiscount - couponValue;

  return priceWithDiscount > 0 ? priceWithDiscount : 0;
}
