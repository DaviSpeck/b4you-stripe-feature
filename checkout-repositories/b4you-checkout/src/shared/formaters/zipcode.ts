export function FormaterZipCode(cep: string) {
  const rowCep = cep.replace(/[^0-9]/g, "");
  if (rowCep.length > 5) return `${rowCep.slice(0, 5)}-${rowCep.slice(5, 8)}`;
  return rowCep;
}
