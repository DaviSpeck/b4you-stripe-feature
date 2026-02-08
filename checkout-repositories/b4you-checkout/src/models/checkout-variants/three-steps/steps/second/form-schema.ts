import zod from "zod";

export const formAddressSecondStepSchema = zod.object({
  zipcode: zod
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .min(9, { message: "CEP inválido" })
    .trim(),
  street: zod
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .min(3, { message: "Endereço inválido" })
    .trim(),
  number_address: zod
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .trim(),
  neighborhood: zod
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .min(2, { message: "Bairro inválido" })
    .trim(),
  city: zod.string().nullable(),
  state: zod.string().nullable(),
  complement: zod
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
});
