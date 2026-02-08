import { Sales_items } from '../models/Sales_items.mjs';
import { findCoproductionStatusByKey } from '../../status/coproductionStatus.mjs';

export class SalesItemsRepository {
  static async findToSplit(where, t = null) {
    const saleItem = await Sales_items.findOne({
      where,
      nest: true,
      transaction: t,
      attributes: [
        'id',
        'paid_at',
        'payment_method',
        'id_product',
        'id_status',
        'created_at',
        'split_price',
        'subscription_fee',
        'shipping_price',
        'fee_total',
        'id_product',
        'id_offer',
      ],
      include: [
        {
          association: 'product',
          attributes: ['id', 'id_user'],
          paranoid: false,
          include: [
            {
              association: 'producer',
              attributes: ['id'],
              include: [
                {
                  association: 'user_sale_settings',
                  attributes: ['release_pix', 'release_credit_card', 'release_billet'],
                },
              ],
            },
            {
              association: 'coproductions',
              required: false,
              attributes: ['id', 'id_user', 'commission_percentage'],
              where: {
                status: findCoproductionStatusByKey('active').id,
              },
              include: [
                {
                  association: 'user',
                  attributes: ['id'],
                  include: [
                    {
                      association: 'user_sale_settings',
                      attributes: ['release_pix', 'release_credit_card', 'release_billet'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          association: 'affiliate',
          attributes: [
            'subscription_fee',
            'subscription_fee_only',
            'commission_all_charges',
            'commission',
            'subscription_fee_commission',
            'id_user',
          ],
          required: false,
          include: [
            {
              association: 'user',
              attributes: ['id'],
              include: [
                {
                  association: 'user_sale_settings',
                  attributes: ['release_pix', 'release_credit_card', 'release_billet'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!saleItem) return null;
    return saleItem.toJSON();
  }
}
