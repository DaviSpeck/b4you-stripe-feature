export function FormaterCnpj(cnpj: string) {
  const rawCnpj = cnpj.replace(/[^0-9]/g, "");

  if (rawCnpj.length <= 2) return rawCnpj;
  if (rawCnpj.length <= 5) return `${rawCnpj.slice(0, 2)}.${rawCnpj.slice(2)}`;
  if (rawCnpj.length <= 8)
    return `${rawCnpj.slice(0, 2)}.${rawCnpj.slice(2, 5)}.${rawCnpj.slice(5)}`;
  if (rawCnpj.length <= 12)
    return `${rawCnpj.slice(0, 2)}.${rawCnpj.slice(2, 5)}.${rawCnpj.slice(5, 8)}/${rawCnpj.slice(8)}`;

  return `${rawCnpj.slice(0, 2)}.${rawCnpj.slice(2, 5)}.${rawCnpj.slice(5, 8)}/${rawCnpj.slice(8, 12)}-${rawCnpj.slice(12, 14)}`;
}
