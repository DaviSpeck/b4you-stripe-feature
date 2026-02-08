import { nanoid } from 'nanoid';
import { EVENT_DESCRIPTIONS } from './eventTypes';
import { enqueueEvent } from './eventQueue';

const SESSION_KEY = 'checkout_session_id';

const getStoredSessionId = () => {
  try {
    const fromSession = window.sessionStorage.getItem(SESSION_KEY);
    if (fromSession) return fromSession;
  } catch (error) {
    // noop
  }

  try {
    const fromLocal = window.localStorage.getItem(SESSION_KEY);
    if (fromLocal) return fromLocal;
  } catch (error) {
    // noop
  }

  return null;
};

const storeSessionId = (sessionId) => {
  try {
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
    return;
  } catch (error) {
    // noop
  }

  try {
    window.localStorage.setItem(SESSION_KEY, sessionId);
  } catch (error) {
    // noop
  }
};

export const getSessionId = () => {
  if (typeof window === 'undefined') {
    return `chk_${nanoid(10)}`;
  }

  let sessionId = getStoredSessionId();
  if (sessionId) return sessionId;

  sessionId = `chk_${nanoid(10)}`;
  storeSessionId(sessionId);
  return sessionId;
};

const isIpAddress = (hostname) => {
  const ipRegex =
    /^(?:\d{1,3}\.){3}\d{1,3}$/;
  return ipRegex.test(hostname);
};

export const getCheckoutMode = () => {
  if (typeof window === 'undefined') return 'transparent';
  const hostname = window.location?.hostname || '';
  if (hostname === 'localhost' || isIpAddress(hostname)) {
    return 'development';
  }
  if (hostname.includes('b4you-sandbox.com.br')) {
    return 'sandbox';
  }
  if (hostname.includes('b4you.com.br')) {
    return 'embedded';
  }
  return 'transparent';
};

const getExecutionEnvironment = (hostname) => {
  if (hostname.includes('sandbox')) return 'sandbox';
  if (hostname === 'localhost' || isIpAddress(hostname)) return 'development';
  return 'production';
};

const getRootDomain = (hostname) => {
  if (!hostname) return '';
  if (hostname === 'localhost' || isIpAddress(hostname)) return hostname;

  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
};

const generateEventId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const randomPart = Math.random().toString(16).slice(2);
  const timePart = Date.now().toString(16);
  return `evt_${timePart}_${randomPart}`;
};

export const trackCheckoutEvent = ({
  eventName,
  offerId,
  checkoutType,
  step,
  email,
  phone,
  paymentMethod,
}) => {
  if (!eventName || !offerId || !checkoutType) return;

  const hostname = typeof window !== 'undefined'
    ? window.location?.hostname || ''
    : '';

  const payload = {
    eventId: generateEventId(),
    eventName,
    eventDescription: EVENT_DESCRIPTIONS[eventName] || 'Checkout event',
    sessionId: getSessionId(),
    offerId,
    checkoutType,
    checkoutMode: getCheckoutMode(),
    executionEnvironment: getExecutionEnvironment(hostname),
    fullHostname: hostname,
    rootDomain: getRootDomain(hostname),
    step,
    email,
    phone,
    paymentMethod,
    timestamp: Date.now(),
  };

  enqueueEvent(payload);
};
