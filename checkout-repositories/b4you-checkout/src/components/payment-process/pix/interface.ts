// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
const PaymentProcessTypes = [
  "sucess",
  "information",
  "peading",
  "error_server",
] as const;

export type paymentStageType = (typeof PaymentProcessTypes)[number];

type AddressType = {
  zipcode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string | null;
  state: string | null;
  complement?: string | null;
};

export type paymentPixDataType = {
  full_name: string;
  email: string;
  whatsapp: string;
  type: "single" | "subscription";
  payment_method: "pix";
  offer_id: string;
  b4f: string | null;
  document_number: string;
  address?: AddressType;
  token: string;
};
