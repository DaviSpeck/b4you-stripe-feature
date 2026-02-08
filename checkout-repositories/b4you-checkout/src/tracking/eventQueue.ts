import { sendEvent } from "./eventSender";
import { CheckoutEventPayload } from "./eventTypes";

const queue: CheckoutEventPayload[] = [];
let isFlushing = false;

function flushQueue() {
  if (isFlushing) return;
  isFlushing = true;

  while (queue.length > 0) {
    const event = queue.shift();
    if (event) {
      sendEvent(event);
    }
  }

  isFlushing = false;
}

export function enqueueEvent(event: CheckoutEventPayload) {
  queue.push(event);
  if (typeof queueMicrotask === "function") {
    queueMicrotask(flushQueue);
    return;
  }
  setTimeout(flushQueue, 0);
}
