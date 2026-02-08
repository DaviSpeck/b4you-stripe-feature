import { sendEvent } from './eventSender';

const queue = [];
let isFlushScheduled = false;

const flushQueue = () => {
  isFlushScheduled = false;
  const items = queue.splice(0, queue.length);
  items.forEach((item) => sendEvent(item));
};

const scheduleFlush = () => {
  if (isFlushScheduled) return;
  isFlushScheduled = true;

  if (typeof queueMicrotask === 'function') {
    queueMicrotask(flushQueue);
    return;
  }

  setTimeout(flushQueue, 0);
};

export const enqueueEvent = (payload) => {
  if (!payload) return;
  queue.push(payload);
  scheduleFlush();
};
