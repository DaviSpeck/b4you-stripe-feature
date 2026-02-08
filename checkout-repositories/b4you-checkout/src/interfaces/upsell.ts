type CardInfoType = {
  brand: string;
  installments_list: { n: number; price: number; total: number }[];
  last_four_digits: string;
};

export interface iUpsellCardType {
  uuid: string;
  card: CardInfoType;
  allowed_payment_methods: Array<"card" | "pix" | "billet">;
  last_payment_method: "card" | "pix" | "billet";
  plan: unknown;
  price: number;
}

export interface iUpsellNewCardPaymentBody {
  offer_id: string | null;
  plan_id: string | null;
  sale_item_id: string;
  payment_method: "card";
  installments: number;
  card: {
    card_number: string;
    card_holder: string;
    expiration_date: string;
    cvv: string;
  };
}

export interface iUpsellNewCardPaymentResponse {
  sale_item_id: string;
}

export interface iUpsellCardTokenizedPaymentBody {
  offer_id: string | null;
  sale_item_id: string;
  payment_method: "card";
  installments: number;
  plan_id?: string | null;
}

export interface iUpsellCardTokenizedPaymentResponse { }

export interface iUpsellNativePaymentResponse {
  pixData?: { sale_item_id: string } | null;
  creditCardData?: { sale_item_id: string } | null;
}