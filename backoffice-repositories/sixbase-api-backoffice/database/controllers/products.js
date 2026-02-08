const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const Products = require('../models/Products');
const dateHelper = require('../../utils/helpers/date');

const averageTicketProduct = async (
  { page, size, start_date, end_date, id_status },
  group_by,
) => {
  const limit = parseInt(size, 10);
  const offset = page * limit;
  const where = {};
  if (start_date && end_date)
    where.created_at = {
      [Op.between]: [
        dateHelper(start_date).startOf('day'),
        dateHelper(end_date).endOf('day'),
      ],
    };

  const products = await Products.findAndCountAll({
    nest: true,
    distinct: true,
    offset,
    limit,
    subQuery: false,
    where,
    paranoid: false,
    order: [['total_sales', 'DESC']],
    attributes: [
      'id',
      'uuid',
      'name',
      [
        Sequelize.fn('sum', Sequelize.col('sales_items.price_product')),
        'total_sales',
      ],
      [Sequelize.fn('count', Sequelize.col('sales_items.id')), 'count_sales'],
    ],
    group: [group_by],
    include: [
      {
        association: 'sales_items',
        where: { id_status },
        attributes: ['id_status'],
      },
      {
        association: 'producer',
        attributes: ['first_name', 'last_name', 'email', 'whatsapp'],
      },
    ],
  });
  return products;
};

const findFilteredProducts = async (where, page, size) => {
  const offset = Number(page) * Number(size);
  const limit = Number(size);
  const products = await Products.findAndCountAll({
    where,
    distinct: true,
    offset,
    limit,
    paranoid: false,
    order: [['id', 'DESC']],
    attributes: [
      'uuid',
      'payment_type',
      'support_email',
      'support_whatsapp',
      'id_type',
      'warranty',
      'name',
    ],
    include: [
      {
        association: 'producer',
        paranoid: false,
        attributes: ['full_name', 'uuid'],
      },
    ],
  });
  return products;
};

const updateProduct = async (where, data, t = null) => {
  await Products.update(
    data,
    {
      where,
    },
    t
      ? {
          transaction: t,
        }
      : null,
  );
};

module.exports = { averageTicketProduct, findFilteredProducts, updateProduct };
