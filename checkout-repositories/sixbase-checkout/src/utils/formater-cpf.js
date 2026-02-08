export function FormatterCpf(value) {
  const rawCpf = value.replace(/[^0-9]/g, '');

  if (rawCpf.length <= 3) return rawCpf;
  if (rawCpf.length <= 6) return `${rawCpf.slice(0, 3)}.${rawCpf.slice(3)}`;
  if (rawCpf.length <= 9)
    return `${rawCpf.slice(0, 3)}.${rawCpf.slice(3, 6)}.${rawCpf.slice(6)}`;

  return `${rawCpf.slice(0, 3)}.${rawCpf.slice(3, 6)}.${rawCpf.slice(
    6,
    9
  )}-${rawCpf.slice(9, 11)}`;
}
