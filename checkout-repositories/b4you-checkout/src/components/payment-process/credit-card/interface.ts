// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
const PaymentProcessTypes = [
  "sucess",
  "peading",
  "denied",
  "error_server",
] as const;

export type paymentStageType = (typeof PaymentProcessTypes)[number];

type CardType = {
  card_number: string;
  card_holder: string;
  expiration_date: string;
  cvv: string;
  document_number: string;
  installments: number;
  amount?: number;
};

type AddressType = {
  zipcode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string | null;
  state: string | null;
  complement?: string | null;
};

export type paymentCreditCardDataType = {
  full_name: string;
  email: string;
  whatsapp: string;
  type: "single" | "subscription";
  payment_method: "card" | "pix" | "billet";
  offer_id: string;
  sessionID: string;
  document_number: string;
  cards: CardType[];
  b4f: string | null;
  address?: AddressType;
  order_bumps: string[];
  coupon: string | null;
  token: string;
  visitorId: string | null;
};
