import { findCallbackStatus } from '../status/callbackStatus.mjs';

export const callbackWebhookParser = ({ transaction_id, status }) => ({
  transaction_id,
  status: findCallbackStatus(status),
});
