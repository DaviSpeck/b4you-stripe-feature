import { apiEndpoint } from "api";

const EVENTS_ENDPOINT = `${apiEndpoint}/events/checkout`;

export const sendEvent = (payload) => {
  if (!payload) return;

  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(EVENTS_ENDPOINT, blob);
      return;
    }
  } catch {
    // noop
  }

  try {
    fetch(EVENTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
      credentials: 'omit',
    });
  } catch {
    // noop
  }
};