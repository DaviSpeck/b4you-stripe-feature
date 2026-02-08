const Subscriptions = require('../../database/models/Subscriptions');

module.exports = class SubscriptionRepository {
  static async update(where, data, t = null) {
    await Subscriptions.update(data, { where, transaction: t });
  }
};
