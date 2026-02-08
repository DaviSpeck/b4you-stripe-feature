import { iCoupon } from "@/interfaces/coupon";

export type CouponValidationResponse =
  | iCoupon
  | {
      valid: boolean;
      code?: string;
      message?: string;
      coupon?: iCoupon | null;
    };

type ParsedCouponValidation = {
  coupon: iCoupon | null;
  invalidMessage?: string;
  invalidCode?: string;
};

export function parseCouponValidation(
  data?: CouponValidationResponse | null,
): ParsedCouponValidation {
  if (!data) {
    return { coupon: null };
  }

  if ("valid" in data) {
    if (!data.valid) {
      return {
        coupon: null,
        invalidMessage: data.message ?? "Cupom inválido",
        invalidCode: data.code,
      };
    }

    return {
      coupon: data.coupon ?? null,
    };
  }

  return { coupon: data };
}
