import { enqueueEvent } from "./eventQueue";
import {
  CheckoutEventName,
  CheckoutEventPayload,
  CheckoutMode,
  CheckoutType,
  checkoutEventDescriptions,
} from "./eventTypes";
import { getDomainInfo, getExecutionEnvironment } from "./utils";

let checkoutType: CheckoutType | null = null;
let currentSessionId: string | null = null;

export function getCheckoutMode(): CheckoutMode {
  if (typeof window === "undefined") return "embedded";

  const hostname = window.location.hostname;

  if (hostname.includes("b4you-sandbox.com.br")) {
    return "sandbox";
  }

  if (hostname.includes("b4you.com.br")) {
    return "embedded";
  }

  if (hostname === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return "development";
  }

  return "transparent";
}

export function setCheckoutTypeOnce(type: CheckoutType) {
  if (!checkoutType) {
    checkoutType = type;
  }
}

export function getCheckoutType(): CheckoutType {
  return checkoutType ?? "standard";
}

function generateEventId() {
  const cryptoObj = typeof globalThis !== "undefined"
    ? globalThis.crypto
    : undefined;

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    );

    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
      .slice(6, 8)
      .join("")}-${hex.slice(8, 10).join("")}-${hex
        .slice(10, 16)
        .join("")}`;
  }

  return `evt_${Math.random().toString(16).slice(2)}${Date.now()}`;
}

function generateSessionId() {
  return `chk_${generateEventId().replace(/-/g, "").slice(0, 8)}`;
}

export function getSessionId(): { sessionId: string; isNew: boolean } | null {
  if (currentSessionId) {
    return { sessionId: currentSessionId, isNew: false };
  }

  currentSessionId = generateSessionId();
  return { sessionId: currentSessionId, isNew: true };
}

type TrackEventInput = {
  eventName: CheckoutEventName;
  offerId: string;
  details?: Pick<
    CheckoutEventPayload,
    "step" | "email" | "phone" | "paymentMethod"
  >;
};

export function trackCheckoutEvent({
  eventName,
  offerId,
  details,
}: TrackEventInput) {
  if (typeof window === "undefined") return;
  if (!offerId) return;

  const session = getSessionId();

  if (!session) return;

  const { fullHostname, rootDomain } = getDomainInfo(window.location.hostname);

  const payload: CheckoutEventPayload = {
    eventId: generateEventId(),
    eventName,
    eventDescription: checkoutEventDescriptions[eventName],
    sessionId: session.sessionId,
    offerId,
    checkoutType: getCheckoutType(),
    checkoutMode: getCheckoutMode(),
    executionEnvironment: getExecutionEnvironment(fullHostname),
    fullHostname,
    rootDomain,
    step: details?.step,
    email: details?.email,
    phone: details?.phone,
    paymentMethod: details?.paymentMethod,
    timestamp: Date.now(),
  };

  enqueueEvent(payload);
}
