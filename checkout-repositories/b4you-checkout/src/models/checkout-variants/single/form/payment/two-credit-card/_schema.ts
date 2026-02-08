import cardValidator from "card-validator";
import z from "zod";

const cardExpirySchema = z
  .string({ required_error: "Campo obrigatório" })
  .trim()
  .min(1, { message: "Campo obrigatório" })
  .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: "Formato inválido. use MM/AA (ex: 02/30)",
  })
  .refine(
    (expiry) => {
      const [monthStr, yearStr] = expiry.split("/");
      const month = parseInt(monthStr, 10);
      const year = parseInt(`20${yearStr}`, 10);

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (year > currentYear) return true;
      if (year === currentYear && month >= currentMonth) return true;

      return false;
    },
    { message: "Cartão vencido" },
  );

export const FormCreditCardBase = z.object({
  cardNumber: z
    .string({ required_error: "Campo obrigatório" })
    .trim()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length >= 15 && value.length <= 18, {
      message: "Número de cartão inválido",
    })
    .refine((number) => cardValidator.number(number).isValid, {
      message: "Número de cartão inválido",
    }),
  secreteCardNumber: z
    .string({ required_error: "Campo obrigatório" })
    .trim()
    .min(3, { message: "Código de segurança inválido" })
    .max(4, { message: "Código de segurança inválido" }),
  cardValidate: cardExpirySchema.refine(
    (expiry) => cardValidator.expirationDate(expiry).isValid,
    { message: "Data de validade inválida" },
  ),
  cardHolderName: z
    .string({ required_error: "Campo obrigatório" })
    .trim()
    .min(2, { message: "Nome inválido" }),
});

export const FormCreditCardValidation = FormCreditCardBase.superRefine(
  (values, ctx) => {
    const { secreteCardNumber, cardValidate } = values;

    if (!cardValidator.cvv(secreteCardNumber).isValid) {
      ctx.addIssue({
        path: ["secreteCardNumber"],
        code: z.ZodIssueCode.custom,
        message: "Código de segurança inválido",
      });
    }

    const [month, year] = cardValidate.split("/");
    if (!cardValidator.expirationDate(`${month}/${year}`).isValid) {
      ctx.addIssue({
        path: ["cardValidate"],
        code: z.ZodIssueCode.custom,
        message: "Data de validade inválida",
      });
    }
  },
);
