import z from "zod";

const phoneSchema = z
  .string({ required_error: "campo obrigatório" })
  .min(1, { message: "campo obrigatório" })
  .transform((val) => val.replace(/\D/g, ""))
  .refine(
    (digits) => digits.length === 10 || digits.length === 11,
    {
      message: "Número inválido. Use (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX",
    }
  );

export const formUserDataFirstStepSchema = z.object({
  full_name: z
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .refine((value) => value.trim().split(" ").length > 1, {
      message: "digite seu nome completo",
    }),

  email: z
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .email({ message: "email inválido" })
    .trim(),
  whatsapp: phoneSchema,
});
