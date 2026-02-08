import { CheckoutEventPayload } from "./eventTypes";

const getEventsEndpoint = () =>
  `${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/events/checkout`;

export function sendEvent(payload: CheckoutEventPayload) {
  try {
    const body = JSON.stringify(payload);
    const eventsEndpoint = getEventsEndpoint();

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon(eventsEndpoint, blob);
      if (sent) {
        return;
      }
    }

    fetch(eventsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      keepalive: true,
      credentials: "omit",
    }).catch(() => {
      // tracking nunca bloqueia checkout
    });
  } catch {
    // tracking nunca bloqueia checkout
  }
}
