import { iFormDataFistStep } from "@/models/checkout-variants/three-steps/steps/first/interface";

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
const PaymentStageTypes = [
  "created-code",
  "peading",
  "error-server",
  "error-information",
] as const;

export type PaymentStageType = (typeof PaymentStageTypes)[number];

type AddressType = {
  zipcode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string | null;
  state: string | null;
  complement?: string | null;
};

export type BankSlipDataType = {
  sale_id: string;
  due: string;
  line_code: string;
  bar_code: string;
  amount: number;
  url: string;
};

export type paymentBankSlipDataType = {
  document_number: string;
  address?: AddressType;
  payment_method: "billet";
  offer_id: string;
  coupon: null | string;
  b4f: string | null;
  token: string;
} & iFormDataFistStep;
