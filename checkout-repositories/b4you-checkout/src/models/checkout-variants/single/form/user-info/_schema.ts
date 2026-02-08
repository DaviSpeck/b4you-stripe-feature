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

export const FormUserInfoValidation = z.object({
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
  isCnpj: z.boolean(),
  document_number: z
    .string({ required_error: "campo obrigatório" })
    .trim()
    .min(1, { message: "campo obrigatório" })
    .superRefine((val, ctx) => {
      const digits = val.replace(/\D/g, "");

      if (digits.length === 11) {
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
