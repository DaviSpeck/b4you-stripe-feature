import { Sales_items } from '../database/models/Sales_items.mjs';
import { Charges } from '../database/models/Charges.mjs';
import { Commissions } from '../database/models/Commissions.mjs';
import { Subscriptions } from '../database/models/Subscriptions.mjs';
import { StudentProducts } from '../database/models/StudentProducts.mjs';
import aws from '../queues/aws.mjs';
import { findSubscriptionStatusByKey } from '../status/subscriptions.mjs';
import { findChargeStatusByKey } from '../status/charges.mjs';
import { findCommissionsStatus } from '../status/commissions.mjs';
import { findSalesStatusByKey } from '../status/sales.mjs';

export default class ChargebackLost {
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
          await aws.add('sales-metrics-hourly', {
            id_user: comm.id_user,
            id_product: saleItem.id_product,
            amount: comm.amount,
            paid_at: saleItem.paid_at,
            created_at: null,
            statusAfter: 'chargeback',
            statusBefore: 'chargeback_dispute',
            payment_method: saleItem.payment_method,
          });
        });
      }
      await Sales_items.update(
        { id_status: findSalesStatusByKey('chargeback').id },
        {
          where: {
            id: saleItem.id,
          },
          transaction: this.t,
        }
      );
      await Commissions.update(
        { id_status: findCommissionsStatus('chargeback').id },
        {
          where: {
            id_sale_item: saleItem.id,
          },
          transaction: this.t,
        }
      );

      await StudentProducts.destroy({
        where: {
          id_sale_item: saleItem.id,
        },
        transaction: this.t,
      });

      if (saleItem.id_subscription) {
        await Subscriptions.update(
          {
            id_status: findSubscriptionStatusByKey('chargeback').id,
          },
          {
            where: {
              id: saleItem.id_subscription,
            },
            transaction: this.t,
          }
        );
      }
    }
    await Charges.update(
      { id_status: findChargeStatusByKey('chargeback').id },
      { where: { id: charge.id }, transaction: this.t }
    );
    console.log(`CHARGEBACK CONFIRMED WITH PSP ID ${this.psp_id}`);
    return true;
  }
}
