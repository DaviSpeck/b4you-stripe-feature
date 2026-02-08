import { Sales_items } from '../database/models/Sales_items.mjs';
import { Charges } from '../database/models/Charges.mjs';
import { Commissions } from '../database/models/Commissions.mjs';
import { Subscriptions } from '../database/models/Subscriptions.mjs';
import { ReferralCommissions } from '../database/models/ReferralCommissions.mjs';
import { ReferralBalance } from '../database/models/ReferralBalance.mjs'
import { findSubscriptionStatusByKey } from '../status/subscriptions.mjs';
import { findChargeStatusByKey } from '../status/charges.mjs';
import { findCommissionsStatus } from '../status/commissions.mjs';
import { findSalesStatusByKey } from '../status/sales.mjs';
import { findReferralCommissionStatus } from '../status/referralCommissions.mjs';
import moment from 'moment';
import aws from '../queues/aws.mjs';

const DATABASE_DATE_WITHOUT_TIME = 'YYYY-MM-DD';
export default class ChargebackReverse {
  constructor({ psp_id, t }) {
    this.psp_id = psp_id;
    this.t = t;
  }

  async execute() {
    const charge = await Charges.findOne({
      nest: true,
      where: {
        psp_id: this.psp_id,
      },
      attributes: ['id'],
      include: [
        {
          association: 'sales_items',
          attributes: [
            'id',
            'id_student',
            'id_product',
            'id_sale',
            'id_subscription',
            'paid_at',
            'created_at',
            'payment_method',
          ],
        },
      ],
    });
    if (!charge) {
      console.log('Charge with psp id not found');
      return;
    }
    for await (const saleItem of charge.sales_items) {
      const commissions = await Commissions.findAll({
        where: { id_sale_item: saleItem.id },
        raw: true,
      });
      for await (const comm of commissions) {
        this.t.afterCommit(async () => {
          await aws.add('usersRevenue', {
            id_user: comm.id_user,
            amount: comm.amount,
            operation: 'increment',
            paid_at: moment(saleItem.paid_at).subtract(3, 'hours').format(DATABASE_DATE_WITHOUT_TIME),
          });
          await aws.add('sales-metrics-hourly', {
            id_user: comm.id_user,
            id_product: saleItem.id_product,
            amount: comm.amount,
            paid_at: saleItem.paid_at,
            created_at: null,
            statusAfter: 'paid',
            statusBefore: 'chargeback',
            payment_method: saleItem.payment_method,
          });
        });
      }
      await Sales_items.update(
        { id_status: findSalesStatusByKey('paid').id },
        {
          where: {
            id: saleItem.id,
          },
          transaction: this.t,
        }
      );
      await Commissions.update(
        { id_status: findCommissionsStatus('waiting').id, release_date: moment().add(1, 'd') },
        {
          where: {
            id_sale_item: saleItem.id,
          },
          transaction: this.t,
        }
      );

      if (saleItem.id_subscription) {
        await Subscriptions.update(
          {
            id_status: findSubscriptionStatusByKey('active').id,
          },
          {
            where: {
              id: saleItem.id_subscription,
            },
            transaction: this.t,
          }
        );
      }

      const referralCommission = await ReferralCommissions.findOne({
        raw: true,
        where: { id_sale_item: saleItem.id },
      });
      if (referralCommission) {
        await ReferralBalance.increment('total', {
          by: referralCommission.amount,
          where: { id_user: referralCommission.id_user },
          transaction: this.t,
        });
        await ReferralCommissions.update(
          {
            id_status: findReferralCommissionStatus('release-pending').id,
            release_date: moment().add(1, 'd'),
          },
          { where: { id: referralCommission.id }, transaction: this.t }
        );
      }
    }
    await Charges.update(
      { id_status: findChargeStatusByKey('paid').id },
      { where: { id: charge.id }, transaction: this.t }
    );
    console.log(`CHARGEBACK REVERSED CONFIRMED WITH PSP ID ${this.psp_id}`);
    return true;
  }
}
