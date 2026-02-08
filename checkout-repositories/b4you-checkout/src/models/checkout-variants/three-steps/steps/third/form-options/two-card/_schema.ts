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

function isValidCnpj(cnpj: string): boolean {
  const cleaned = cnpj.replace(/[^\d]+/g, "");
  if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) return false;

  const t = cleaned.length - 2;
  const d = cleaned.substring(t);
  const d1 = parseInt(d.charAt(0));
  const d2 = parseInt(d.charAt(1));
  const calc = (x: number) => {
    let n = 0;
    let y = x - 7;
    for (let i = 0; i < x; i++) {
      n += Number(cleaned.charAt(i)) * y--;
      if (y < 2) y = 9;
    }
    const r = 11 - (n % 11);
    return r > 9 ? 0 : r;
  };

  return calc(t) === d1 && calc(t + 1) === d2;
}

function isValidCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;

  const calcCheckDigit = (base: string, factor: number): number => {
    let total = 0;
    for (let i = 0; i < base.length; i++) {
      total += parseInt(base[i]) * factor--;
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const base = cleaned.slice(0, 9);
  const digit1 = calcCheckDigit(base, 10);
  const digit2 = calcCheckDigit(base + digit1, 11);

  return cleaned === base + digit1.toString() + digit2.toString();
}

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
  isCnpj: z.boolean().default(false),
  document: z
    .string({ required_error: "campo obrigatório" })
    .trim()
    .min(1, { message: "campo obrigatório" })
    .superRefine((val, ctx) => {
      const digits = val.replace(/\D/g, "");

      if (digits.length === 11 && !val.includes("/")) {
        if (!isValidCpf(digits)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CPF inválido",
          });
        }
      } else if (digits.length === 14) {
        if (!isValidCnpj(digits)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CNPJ inválido",
          });
        }
      } else {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Documento inválido",
        });
      }
    }),
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
