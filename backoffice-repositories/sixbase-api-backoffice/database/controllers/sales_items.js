const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const Sales_items = require('../models/Sales_items');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const dateHelper = require('../../utils/helpers/date');

const findSaleItemRefund = async (where) => {
  const saleItem = await Sales_items.findOne({
    nest: true,
    where,
    attributes: [
      'id',
      'id_student',
      'paid_at',
      'price',
      'payment_method',
      'valid_refund_until',
      'price_total',
      'id_sale',
      'credit_card',
    ],
    include: [
      {
        association: 'sale',
        attributes: ['full_name'],
      },
      {
        association: 'product',
        paranoid: false,
        attributes: ['id_user', 'name', 'payment_type'],
      },
      {
        association: 'student',
        attributes: ['bank_code', 'account_agency', 'account_number'],
      },
      {
        association: 'commissions',
      },
      {
        association: 'charges',
        attributes: [
          'uuid',
          'psp_id',
          'provider_id',
          'provider',
          'payment_method',
          'price',
          'paid_at',
          'updated_at',
          'installments',
        ],
      },
    ],
  });
  if (!saleItem) return null;
  return saleItem.toJSON();
};

const findGeneralMetrics = async ({ start_date, end_date }) => {
  const where = {
    id_status: findSalesStatusByKey('paid').id,
  };
  if (start_date && end_date)
    where.created_at = {
      [Op.between]: [
        dateHelper(start_date).startOf('day').utc(),
        dateHelper(end_date).endOf('day').utc(),
      ],
    };
  const salesItems = await Sales_items.findAll({
    where,
    raw: true,
    attributes: [
      'payment_method',
      [Sequelize.fn('sum', Sequelize.col('price_product')), 'total_amount'],
    ],
    group: ['payment_method'],
  });
  return salesItems;
};

const averageSales = async ({ start_date, end_date }) => {
  const where = {
    id_status: findSalesStatusByKey('paid').id,
  };
  if (start_date && end_date)
    where.created_at = {
      [Op.between]: [
        dateHelper(start_date).startOf('day').utc(),
        dateHelper(end_date).endOf('day').utc(),
      ],
    };
  const [sales_items] = await Sales_items.findAll({
    where,
    attributes: [
      [Sequelize.fn('sum', Sequelize.col('price_product')), 'total_amount'],
      [Sequelize.fn('count', Sequelize.col('sales_items.id')), 'count_sales'],
    ],
  });
  const { total_amount, count_sales } = sales_items.toJSON();
  return {
    total_amount,
    count_sales,
    average: total_amount / count_sales,
  };
};

const averageRefunds = async ({ start_date, end_date }) => {
  const where = {
    id_status: findSalesStatusByKey('refunded').id,
  };
  if (start_date && end_date)
    where.created_at = {
      [Op.between]: [
        dateHelper(start_date).startOf('day'),
        dateHelper(end_date).endOf('day'),
      ],
    };
  const refunds = await Sales_items.findAll({
    where,
    attributes: [
      [Sequelize.fn('count', Sequelize.col('sales_items.id')), 'count'],
    ],
  });
  return refunds;
};

const updateSaleItem = async (data, where, t = null) =>
  Sales_items.update(data, { where, transaction: t });

module.exports = {
  findGeneralMetrics,
  averageSales,
  averageRefunds,
  findSaleItemRefund,
  updateSaleItem,
};
