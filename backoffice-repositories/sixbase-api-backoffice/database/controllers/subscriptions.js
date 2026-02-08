const Subscriptions = require('../models/Subscriptions');

module.exports.updateSubscription = async (where, data, t = null) =>
  Subscriptions.update(data, { where, transaction: t });
