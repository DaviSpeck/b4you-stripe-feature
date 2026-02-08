export function FormaterPhone(phone) {
  const rawPhone = phone.replace(/[^0-9]/g, '');
  const truncatedPhone = rawPhone.slice(0, 11);

  if (truncatedPhone.length <= 2) {
    return truncatedPhone;
  }

  if (truncatedPhone.length <= 6) {
    return `(${truncatedPhone.slice(0, 2)}) ${truncatedPhone.slice(2, 6)}`;
  }

  if (truncatedPhone.length <= 10) {
    return `(${truncatedPhone.slice(0, 2)}) ${truncatedPhone.slice(
      2,
      6
    )}-${truncatedPhone.slice(6, 10)}`;
  }

  if (truncatedPhone.length == 10) {
    return `(${truncatedPhone.slice(0, 2)}) ${truncatedPhone.slice(
      2,
      6
    )}-${truncatedPhone.slice(6, 10)}`;
  }

  return `(${truncatedPhone.slice(0, 2)}) ${truncatedPhone.slice(
    2,
    7
  )}-${truncatedPhone.slice(7, 11)}`;
}
