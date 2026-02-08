export interface iUserData {
  full_name: string;
  email: string;
  isCnpj: boolean;
  city: string;
  state: string;
  whatsapp: string;
  zipcode: string;
  document_number: string;
  street: string;
  number_address: string;
  neighborhood: string;
  complement: string;
}

export function userDataStore(user?: Partial<iUserData>): iUserData {
  const data = {
    full_name: "",
    email: "",
    isCnpj: false,
    whatsapp: "",
    zipcode: "",
    city: "",
    state: "",
    street: "",
    document_number: "",
    number_address: "",
    neighborhood: "",
    complement: "",
  };

  const dataStorage: Partial<iUserData> = JSON.parse(
    localStorage.getItem("userDataStore") ?? "{}",
  );

  if (dataStorage) {
    Object.entries(dataStorage).forEach(
      ([key, value]) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        (data[key as keyof iUserData] = value as string | boolean),
    );
  }

  if (user) {
    Object.entries(user).forEach(
      ([key, value]) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        (data[key as keyof iUserData] = value as string | boolean),
    );
  }

  localStorage.setItem("userDataStore", JSON.stringify(data));

  return data;
}
