type ProductType = {
  name: string;
  uuid: string;

  payment: {
    amount: number;
    status?: "pending" | "approved" | "failed" | "refunded" | "dispute";
    payment_method?: string;
  };
  type: string;
  pixels: unknown[];
  id_type: number;

  is_upsell?: boolean;
  quantity?: number;
  payment_method?: "card" | "pix" | "billet";
  offer?: {
    id: number;
    uuid: string;
    name: string;
    price?: number;
  } | null;
  plan?: {
    id: number;
    uuid: string;
    label: string;
    frequency_label?: string;
  } | null;
};

type DeliveryContext = {
  sale_item: {
    uuid: string;
    is_upsell?: boolean;
    quantity?: number;
    payment_method?: string;
  };

  product: {
    id: number;
    uuid: string;
    name: string;
    cover?: string | null;
  };

  offer?: {
    id: number;
    uuid: string;
    name: string;
    price?: number;
  } | null;

  plan?: {
    id: number;
    uuid: string;
    label: string;
    frequency_label?: string;
  } | null;
};

export interface iSaleData {
  total: number;
  payment_method: "card" | "pix" | "billet";
  products: ProductType[];
  student: { full_name: string; email: string };
  membership_redirect: string | null;
  physical: boolean;
  uuid: string;

  delivery_context?: DeliveryContext;
}

export interface iPixSaleData {
  qrcode: string;
  pix_code: string;
  upsell_url: string | null;
  price: number;
}
