import z from "zod";
import { formAddressSecondStepSchema } from "./form-schema";

export interface iFormDataSecondStep
  extends z.infer<typeof formAddressSecondStepSchema> {
  city: string | null;
  state: string | null;
}

export interface iAddress {
  zipcode: string;
  street: string;
  neighborhood: string;
  city: string | null;
  state: string | null;
  complement: null | string;
  number: null | string;
}
