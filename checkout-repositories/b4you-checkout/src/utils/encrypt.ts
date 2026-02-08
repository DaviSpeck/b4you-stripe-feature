import CryptoJS from "crypto-js";

export function encryptData(data: unknown | unknown[]): { encrypted: string } {
  const encryptedHash = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    process.env.NEXT_PUBLIC_SECRET_KEY ?? "",
  ).toString();

  return { encrypted: encryptedHash };
}
