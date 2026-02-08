export interface CheckoutAnalyticsRequestBody {
  start_date: string;
  end_date: string;
  payment_method?: string;
  input?: string;
  statuses?: number[];
  region?: string;
  state?: string;
  id_product?: number;
  id_user?: number;
}
  