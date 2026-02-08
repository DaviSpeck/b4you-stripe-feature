export interface iCoupon {
  uuid: string;
  coupon: string;
  percentage: number;
  payment_methods: string;
  amount: number;
  min_amount: number;
  min_items: number;
  free_shipping: 0 | 1;
  already_used?: boolean;
}
