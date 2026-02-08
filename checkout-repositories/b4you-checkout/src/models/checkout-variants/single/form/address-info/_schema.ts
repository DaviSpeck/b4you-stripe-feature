import z from "zod";

export const FormAddressInfoValidation = z.object({
  zipcode: z
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .min(9, { message: "CEP inválido" })
    .trim(),
  street: z
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .min(3, { message: "Endereço inválido" })
    .trim(),
  number_address: z
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .trim(),
  neighborhood: z
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .min(2, { message: "Bairro inválido" })
    .trim(),
  city: z.string(),
  state: z.string(),
  complement: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
});
