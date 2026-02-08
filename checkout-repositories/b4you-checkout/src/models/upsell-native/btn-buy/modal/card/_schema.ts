import z from "zod";

export const creditCardSchema = z.object({
  cardNumber: z
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .min(16, { message: "número inválido" })
    .trim(),
  secreteCardNumber: z
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .min(3, { message: "valor inválido" })
    .trim(),
  cardValidate: z
    .string({ required_error: "campo obrigatório" })
    .trim()
    .min(1, { message: "campo obrigatório" })
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, {
      message: "formato inválido. Use MM/AA (ex: 02/30)",
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
      {
        message: "cartão vencido",
      },
    ),
  cardHolderName: z
    .string({ required_error: "campo obrigatório" })
    .min(1, { message: "campo obrigatório" })
    .min(2, { message: "nome inválido" })
    .trim(),
});
