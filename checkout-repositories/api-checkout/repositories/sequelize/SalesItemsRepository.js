const { OP } = require('./Sequelize');
const SalesItems = require('../../database/models/Sales_items');
const Students = require('../../database/models/Students');
const Transaction = require('../../database/models/Transactions');
const Users = require('../../database/models/Users');
const Products = require('../../database/models/Products');
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
        {
          association: 'transactions',
          include: [
            {
              association: 'user',
            },
          ],
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

  static async update(where, data) {
    await SalesItems.update(data, {
      where,
    });
  }

  static async findStudentSales(id_student) {
    const salesItems = await SalesItems.findAll({
      nest: true,
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
          model: Students,
          as: 'student',
        },
        {
          association: 'refund',
          required: false,
        },
        {
          association: 'plan',
          paranoid: false,
        },
        {
          model: Transaction,
          as: 'transactions',
          required: false,
          include: [
            {
              model: Users,
              as: 'user',
            },
            {
              association: 'charge',
            },
          ],
        },
        {
          model: Products,
          as: 'product',
          paranoid: false,
          include: [
            {
              model: Users,
              as: 'producer',
            },
          ],
        },
      ],
    });

    return salesItems;
  }
};
