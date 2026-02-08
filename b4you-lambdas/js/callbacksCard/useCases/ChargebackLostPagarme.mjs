import { Sales_items } from '../database/models/Sales_items.mjs';
import { Charges } from '../database/models/Charges.mjs';
import { Commissions } from '../database/models/Commissions.mjs';
import { Subscriptions } from '../database/models/Subscriptions.mjs';
import { Blacklist } from '../database/models/Blacklist.mjs';
import { StudentProducts } from '../database/models/StudentProducts.mjs';
import aws from '../queues/aws.mjs';
import { findSubscriptionStatusByKey } from '../status/subscriptions.mjs';
import { findChargeStatusByKey } from '../status/charges.mjs';
import { findCommissionsStatus } from '../status/commissions.mjs';
import { findSalesStatusByKey } from '../status/sales.mjs';
import { Konduto } from '../services/Konduto.mjs';
const reasonChargebackId = 1;
const types = [
  {
    id: 1,
    label: 'ip',
  },
  {
    id: 2,
    label: 'cpf',
  },
  {
    id: 3,
    label: 'whatsapp',
  },
  {
    id: 4,
    label: 'email',
  },
  {
    id: 5,
    label: 'address',
  },
];

export default class ChargebackLost {
  static async execute({ provider_id, t }) {
    const charge = await Charges.findOne({
      nest: true,
      where: {
        provider_id,
      },
      attributes: ['id', 'id_sale', 'provider', 'provider_id'],
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
        {
          association: 'sale',
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
        t.afterCommit(async () => {
          await aws.add('sales-metrics-hourly', {
            id_user: comm.id_user,
            id_product: saleItem.id_product,
            amount: comm.amount,
            paid_at: saleItem.paid_at,
            created_at: null,
            statusAfter: 'chargeback',
            statusBefore: 'paid',
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
          transaction: t,
        }
      );
      await Commissions.update(
        { id_status: findCommissionsStatus('chargeback').id },
        {
          where: {
            id_sale_item: saleItem.id,
          },
          transaction: t,
        }
      );

      await StudentProducts.destroy({
        where: {
          id_sale_item: saleItem.id,
        },
        transaction: t,
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
            transaction: t,
          }
        );
      }
    }
    await Charges.update(
      { id_status: findChargeStatusByKey('chargeback').id },
      { where: { id: charge.id }, transaction: t }
    );
    console.log(`CHARGEBACK CONFIRMED WITH PROVIDER_ID ${provider_id}`);
    try {
      console.log('INSERT ON BLACKLIST -> charge id:', charge.id);
      const entries = [
        { label: 'cpf', data: charge.sale.document_number },
        { label: 'email', data: charge.sale.email },
        { label: 'whatsapp', data: charge.sale.whatsapp },
      ];

      if (charge.sale.params?.ip) {
        entries.push({ label: 'ip', data: charge.sale.params.ip });
      }
      if (charge.sale.address?.city) {
        entries.push({
          label: 'address',
          data: JSON.stringify(charge.sale.address),
        });
      }
      const typeMap = Object.fromEntries(types.map((t) => [t.label, t.id]));
      for (const entry of entries) {
        if (!entry.data) continue;
        await Blacklist.upsert(
          {
            data: entry.data,
            id_type: typeMap[entry.label],
            id_reason: reasonChargebackId,
            id_sale: charge.id_sale,
            active: true,
          },
          {
            updateOnDuplicate: ['id_reason', 'id_sale', 'active', 'id_type'],
          }
        );
      }
    } catch (error) {
      console.log('error on insert blacklist', error);
    }

    try {
      console.log('SENDING DATA TO KONDUTO');
      const kondutoDigital = new Konduto('DIGITAL');
      const kondutoPhysical = new Konduto('PHYSICAL');
      await kondutoDigital.createBlock(charge.sale.email);
      await kondutoPhysical.createBlock(charge.sale.email);
      try {
        if (charge.provider === 'B4YOU_PAGARME_2') {
          await kondutoPhysical.updateOrder(charge.provider_id);
        } else {
          await kondutoDigital.updateOrder(charge.provider_id);
        }
      } catch (error) {
        console.log('error on send order to konduto', error);
      }
    } catch (error) {
      console.log('error on sending data konduto', error);
    }
    return true;
  }
}
