const { updateSaleItem } = require('../../database/controllers/sales_items');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { findChargeStatusByKey } = require('../../status/chargeStatus');
const { updateCharge } = require('../../database/controllers/charges');
const {
  updateSubscription,
} = require('../../database/controllers/subscriptions');
const {
  findSubscriptionStatusByKey,
} = require('../../status/subscriptionsStatus');
const date = require('../../utils/helpers/date');
const SQS = require('../../queues/aws');
const Cache = require('../../config/Cache');
const {
  findReferralCommissionStatus,
} = require('../../status/referralCommissionStatus');
const ReferralCommissions = require('../../database/models/ReferralCommissions');
const Charges = require('../../database/models/Charges');
const Sales_items = require('../../database/models/Sales_items');

module.exports = class ExpiredPayment {
  static async execute({ psp_id }) {
    const promisesSaleItem = [];
    const promisesSubscriptions = [];
    const charge = await Charges.findOne({
      nest: true,
      attributes: ['id', 'id_user', 'payment_method'],
      where: {
        uuid: psp_id,
        id_status: [
          findChargeStatusByKey('pending').id,
          findChargeStatusByKey('expired').id,
        ],
      },
      include: [
        {
          association: 'sales_items',
          attributes: ['id', 'uuid', 'id_subscription'],
        },
      ],
    });
    if (!charge) return null;
    const { sales_items } = charge;
    const [mainSaleItem] = sales_items;

    await Cache.set(`sale_status_${mainSaleItem.uuid}`, 'expired', 10);

    await updateCharge(charge.id, {
      id_status: findChargeStatusByKey('expired').id,
    });

    for await (const { id, id_subscription } of sales_items) {
      let paidCharges = 0;
      if (id_subscription) {
        promisesSubscriptions.push(
          updateSubscription(
            { id: id_subscription },
            {
              active: false,
              id_status: findSubscriptionStatusByKey('warning').id,
              canceled_at: date().now(),
            },
          ),
        );
        paidCharges = await Sales_items.count({
          where: { id_subscription, id_status: 2 },
        });
      }

      if (paidCharges === 0) {
        promisesSaleItem.push(
          updateSaleItem(
            {
              id_status: findSalesStatusByKey('expired').id,
            },
            { id },
          ),
        );
      }
    }
    await Promise.all(promisesSaleItem);
    await Promise.all(promisesSubscriptions);
    for await (const { id: sale_item_id } of sales_items) {
      await SQS.add('generateNotifications', {
        sale_item_id,
      });

      await ReferralCommissions.update(
        { id_status: findReferralCommissionStatus('expired').id },
        { where: { id_sale_item: sale_item_id } },
      );
    }
    return charge;
  }
};
