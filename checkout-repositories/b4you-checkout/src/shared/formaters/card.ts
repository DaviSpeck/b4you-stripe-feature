function FormatCreditCardNumber(value: string) {
  const raw = value.replace(/[^0-9]/g, "");

  if (raw.length === 14) {
    // Diners Club: 14 dígitos → XXXX XXXXXX XXXX
    if (raw.length <= 10) return `${raw.slice(0, 4)} ${raw.slice(4)}`;
    return `${raw.slice(0, 4)} ${raw.slice(4, 10)} ${raw.slice(10)}`;
  }

  // American Express (15 dígitos) → XXXX XXXXXX XXXXX
  if (raw.length <= 15) {
    if (raw.length <= 4) return raw;
    if (raw.length <= 10) return `${raw.slice(0, 4)} ${raw.slice(4)}`;
    return `${raw.slice(0, 4)} ${raw.slice(4, 10)} ${raw.slice(10, 15)}`;
  }

  // Outros cartões (até 16 dígitos) → XXXX XXXX XXXX XXXX
  const trimmed = raw.slice(0, 16);
  if (trimmed.length <= 4) return trimmed;
  if (trimmed.length <= 8) return `${trimmed.slice(0, 4)} ${trimmed.slice(4)}`;
  if (trimmed.length <= 12)
    return `${trimmed.slice(0, 4)} ${trimmed.slice(4, 8)} ${trimmed.slice(8)}`;
  return `${trimmed.slice(0, 4)} ${trimmed.slice(4, 8)} ${trimmed.slice(8, 12)} ${trimmed.slice(12)}`;
}

function FomaterCvvCvc(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  const truncated = digitsOnly.slice(0, 4);
  return truncated;
}

function FormaterCardExpiry(value: string) {
  const rawExpiry = value.replace(/[^0-9]/g, "").slice(0, 4);

  if (rawExpiry.length <= 2) {
    return rawExpiry;
  }

  return `${rawExpiry.slice(0, 2)}/${rawExpiry.slice(2, 4)}`;
}

interface iCardFormater {
  (valye: string): ReturnType<typeof FormatCreditCardNumber>;
  CvvOrCvC: (value: string) => ReturnType<typeof FomaterCvvCvc>;
  CardExpiry: (value: string) => ReturnType<typeof FormaterCardExpiry>;
}

export const CardFormater: iCardFormater = Object.assign(
  FormatCreditCardNumber,
  {
    CvvOrCvC: FomaterCvvCvc,
    CardExpiry: FormaterCardExpiry,
  },
);
