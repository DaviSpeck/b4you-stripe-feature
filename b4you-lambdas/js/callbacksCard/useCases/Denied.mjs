import { Sales_items } from '../database/models/Sales_items.mjs';
import { Charges } from '../database/models/Charges.mjs';
import { Subscriptions } from '../database/models/Subscriptions.mjs';

import { findSubscriptionStatusByKey } from '../status/subscriptions.mjs';
import { findChargeStatusByKey } from '../status/charges.mjs';
import { findCommissionsStatus } from '../status/commissions.mjs';
import { findSalesStatusByKey } from '../status/sales.mjs';

export default class Denied {
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
      await Sales_items.update(
        { id_status: findSalesStatusByKey('denied').id },
        {
          where: {
            id: saleItem.id,
          },
          transaction: this.t,
        }
      );

      if (saleItem.id_subscription) {
        await Subscriptions.update(
          {
            id_status: findSubscriptionStatusByKey('canceled').id,
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
      { id_status: findChargeStatusByKey('refused').id },
      { where: { id: charge.id }, transaction: this.t }
    );
    console.log(`DENIED WITH PSP ID ${this.psp_id}`);
    return true;
  }
}
