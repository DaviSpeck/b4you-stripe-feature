const { Op } = require('sequelize');
const Invoices = require('../models/Invoices');
const Products = require('../models/Products');
const SalesItems = require('../models/Sales_items');
const Students = require('../models/Students');
const Users = require('../models/Users');
const DateHelper = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');

const formatQuery = ({
  end_date,
  id_plugin,
  id_type,
  id_user,
  input,
  start_date,
}) => {
  let where = { id_user };
  if (id_type) where.id_type = id_type;
  if (start_date && end_date) {
    where.created_at = {
      [Op.between]: [
        DateHelper(start_date).startOf('day').format(DATABASE_DATE),
        DateHelper(end_date).endOf('day').format(DATABASE_DATE),
      ],
    };
  }
  if (input) {
    const rawDocument = input.replace(/\.|-/gm, '');
    where = {
      ...where,
      [Op.or]: {
        '$sale_item.student.full_name$': { [Op.like]: `%${input}%` },
        '$sale_item.student.document_number$': {
          [Op.like]: `%${rawDocument}%`,
        },
        '$sale_item.student.email$': { [Op.like]: `%${input}%` },
      },
    };
  }

  if (id_plugin && id_plugin !== 'none') where.id_plugin = id_plugin;
  if (id_plugin === 'none')
    where.id_plugin = {
      [Op.is]: null,
    };

  return where;
};

const createInvoice = async (data) => Invoices.create(data);

const findInvoicesPaginated = async ({
  end_date,
  id_plugin,
  id_type,
  id_user,
  input,
  page,
  product_uuid,
  size,
  start_date,
}) => {
  const limit = Number(size);
  const offset = Number(limit) * Number(page);
  const where = formatQuery({
    end_date,
    id_plugin,
    id_type,
    id_user,
    input,
    product_uuid,
    start_date,
  });

  let where_product = {};

  if (product_uuid && product_uuid !== 'all') {
    where_product.uuid = product_uuid;
  }

  const invoices = await Invoices.findAndCountAll({
    nest: true,
    limit,
    offset,
    where,
    order: [['created_at', 'DESC']],
    group: ['id'],
    attributes: ['id', 'uuid', 'id_type', 'created_at', 'id_plugin'],
    subQuery: false,
    include: [
      {
        association: 'transaction',
        attributes: ['id', 'price_product'],
        required: true,
        include: [
          {
            association: 'sales_items',
            attributes: ['id'],
            required: true,
            include: [
              {
                association: 'student',
                attributes: ['document_number', 'full_name', 'email'],
              },
              {
                association: 'product',
                paranoid: false,
                attributes: ['id', 'uuid', 'name'],
                where: {
                  ...where_product,
                },
                required: true,
              },
            ],
          },
        ],
      },
      {
        model: Users,
        as: 'receiver',
      },
    ],
  });
  return {
    rows: invoices.rows.map((r) => r.toJSON()),
    count: invoices.count.length,
  };
};

const findInvoicesXls = async ({
  end_date,
  id_plugin,
  id_type,
  id_user,
  input,
  product_uuid,
  start_date,
}) => {
  const where = formatQuery({
    end_date,
    id_plugin,
    id_type,
    id_user,
    input,
    product_uuid,
    start_date,
  });

  const where_product = {};

  if (product_uuid && product_uuid !== 'all') {
    where_product.uuid = product_uuid;
  }

  const invoices = await Invoices.findAll({
    nest: true,
    where,
    order: [['created_at', 'DESC']],
    subQuery: false,
    group: ['id'],
    attributes: ['id', 'uuid', 'id_type', 'created_at', 'id_plugin'],
    include: [
      {
        association: 'transaction',
        attributes: ['id', 'price_product'],
        required: true,
        include: [
          {
            association: 'sales_items',
            attributes: ['id'],
            required: true,
            include: [
              {
                association: 'student',
                attributes: ['full_name', 'document_number', 'email'],
              },
              {
                association: 'product',
                required: true,
                paranoid: false,
                attributes: ['uuid', 'name'],
                where: {
                  ...where_product,
                },
              },
            ],
          },
        ],
      },
      {
        model: Users,
        as: 'receiver',
      },
    ],
  });
  return invoices;
};

const findOneInvoice = async (where) =>
  Invoices.findOne({
    nest: true,
    where,
    include: [
      {
        model: Users,
        as: 'user',
      },
      {
        model: Users,
        as: 'receiver',
      },
      {
        association: 'transaction',
        include: [
          {
            association: 'sales_items',
            include: [
              {
                model: Students,
                as: 'student',
              },
              {
                model: Products,
                as: 'product',
                paranoid: false,
              },
            ],
          },
        ],
      },
    ],
  });

const findAllInvoices = async (where) =>
  Invoices.findAll({
    nest: true,
    where,
    include: [
      {
        model: SalesItems,
        as: 'sale_item',
        include: [
          {
            model: Students,
            as: 'student',
          },
          {
            model: Products,
            as: 'product',
          },
        ],
      },
      {
        model: Users,
        as: 'receiver',
      },
    ],
  });

module.exports = {
  createInvoice,
  findAllInvoices,
  findInvoicesPaginated,
  findInvoicesXls,
  findOneInvoice,
};
