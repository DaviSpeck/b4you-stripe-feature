import CryptoJS from "crypto-js";

export function decryptData(encryptedData: { encrypted: string }): object {
  const bytes = CryptoJS.AES.decrypt(
    encryptedData.encrypted,
    process.env.NEXT_PUBLIC_SECRET_KEY ?? "",
  );

  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

  return JSON.parse(decryptedString);
}
