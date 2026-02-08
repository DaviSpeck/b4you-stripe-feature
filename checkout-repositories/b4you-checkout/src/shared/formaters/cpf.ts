export function FormaterCpf(cpf: string) {
  const rawCpf = cpf.replace(/[^0-9]/g, "");

  if (rawCpf.length <= 3) return rawCpf;
  if (rawCpf.length <= 6) return `${rawCpf.slice(0, 3)}.${rawCpf.slice(3)}`;
  if (rawCpf.length <= 9)
    return `${rawCpf.slice(0, 3)}.${rawCpf.slice(3, 6)}.${rawCpf.slice(6)}`;

  return `${rawCpf.slice(0, 3)}.${rawCpf.slice(3, 6)}.${rawCpf.slice(
    6,
    9,
  )}-${rawCpf.slice(9, 11)}`;
}
