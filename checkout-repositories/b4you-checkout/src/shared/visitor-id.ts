import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { v4 as uuidv4 } from "uuid";

export async function getFingerprint() {
  try {
    if (typeof window === "undefined") {
      throw new Error("Fingerprint called on server");
    }

    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const result = await fp.get();
    const visitorId = result.visitorId;

    let localUuid = localStorage.getItem("local_visitor_uuid");
    if (!localUuid) {
      localUuid = uuidv4();
      localStorage.setItem("local_visitor_uuid", localUuid);
    }

    const combinedId = `${visitorId}-${localUuid}`;

    return combinedId;
  } catch {
    let fallbackUuid = localStorage.getItem("local_visitor_uuid");
    if (!fallbackUuid) {
      fallbackUuid = uuidv4();
      localStorage.setItem("local_visitor_uuid", fallbackUuid);
    }

    return `fallback-${fallbackUuid}`;
  }
}
