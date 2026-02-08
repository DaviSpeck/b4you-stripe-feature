import { Subscriptions } from '../models/Subscriptions.mjs';

export const updateSubscription = async (where, data, t = null) =>
  Subscriptions.update(data, { where, transaction: t });
