const { OP } = require('./Sequelize');
const SalesItems = require('../../database/models/Sales_items');
const {
  findCoproductionStatusByKey,
} = require('../../status/coproductionsStatus');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { DATABASE_DATE } = require('../../types/dateTypes');
const date = require('../../utils/helpers/date');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');

module.exports = class SalesItemsRepository {
  static async find(where) {
    const saleItem = await SalesItems.findOne({
      nest: true,
      where,
      include: [
        { association: 'offer' },
        {
          association: 'commissions',
        },
        {
          association: 'product',
          paranoid: false,
          include: [
            {
              association: 'producer',
              include: [
                {
                  association: 'user_sale_settings',
                },
              ],
            },
            {
              association: 'coproductions',
              where: {
                status: findCoproductionStatusByKey('active').id,
              },
              required: false,
              include: [
                {
                  association: 'user',
                  include: [
                    {
                      association: 'user_sale_settings',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (saleItem) return saleItem.toJSON();
    return saleItem;
  }

  static async findToSplit(where, t = null) {
    const saleItem = await SalesItems.findOne({
      where,
      nest: true,
      transaction: t,
      include: [
        {
          association: 'product',
          include: [
            {
              association: 'producer',
              include: [
                {
                  association: 'user_sale_settings',
                },
              ],
            },
            {
              association: 'coproductions',
              required: false,
              where: {
                status: findCoproductionStatusByKey('active').id,
              },
              include: [
                {
                  association: 'user',
                  include: [
                    {
                      association: 'user_sale_settings',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          association: 'affiliate',
          include: [
            {
              association: 'user',
              include: [
                {
                  association: 'user_sale_settings',
                },
              ],
            },
          ],
        },
      ],
    });

    if (saleItem) return saleItem.toJSON();
    return saleItem;
  }

  static async findForWithheldBalance(id_user) {
    const salesItems = await SalesItems.findAll({
      nest: true,
      where: {
        id_status: findSalesStatusByKey('paid').id,
        paid_at: {
          [OP.gte]: date().subtract(30, 'd').format(DATABASE_DATE),
        },
        [OP.or]: {
          '$product.id_user$': id_user,
          '$product.coproductions.id_user$': id_user,
          '$affiliate.id_user$': id_user,
        },
      },
      include: [
        {
          association: 'transactions',
          where: {
            id_type: findTransactionTypeByKey('commission').id,
            id_user,
          },
        },
        {
          association: 'product',
          paranoid: false,
          include: [
            {
              association: 'coproductions',
            },
          ],
        },
        {
          association: 'affiliate',
        },
      ],
    });

    return salesItems;
  }

  static async update(where, data, t = null) {
    await SalesItems.update(data, {
      where,
      transaction: t,
    });
  }

  static async findStudentSales(id_student) {
    const salesItems = await SalesItems.findAll({
      nest: true,
      attributes: [
        'uuid',
        'price_total',
        'type',
        'valid_refund_until',
        'id_status',
        'payment_method',
        'credit_card',
        'created_at',
      ],
      where: {
        id_student,
        id_status: [
          findSalesStatusByKey('paid').id,
          findSalesStatusByKey('request-refund').id,
          findSalesStatusByKey('refunded').id,
        ],
      },
      order: [['id', 'desc']],
      include: [
        {
          association: 'student',
          attributes: ['id', 'full_name', 'email', 'document_number'],
        },
        {
          association: 'product',
          paranoid: false,
          attributes: [
            'name',
            'cover',
            'support_email',
            'support_whatsapp',
            'content_delivery',
            'payment_type',
            'id_type',
          ],
          include: [
            {
              association: 'producer',
              attributes: ['full_name'],
            },
          ],
        },
      ],
    });

    return salesItems.map((s) => s.toJSON());
  }
};
