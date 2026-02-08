const Charges = require('../models/Charges');
const Lessons = require('../models/Lessons');
const Lessons_attachments = require('../models/Lessons_attachments');
const Modules = require('../models/Modules');
const Products = require('../models/Products');
const Products_ebooks = require('../models/Products_ebooks');
const Products_gallery = require('../models/Product_gallery');
const Sales = require('../models/Sales');
const Sales_items = require('../models/Sales_items');
const Students = require('../models/Students');
const Student_progress = require('../models/Student_progress');
const Study_history = require('../models/Study_history');
const Users = require('../models/Users');
const { findSalesStatusByKey } = require('../../status/salesStatus');

const createSale = async (saleObject, t = null) => {
  try {
    const sale = await Sales.create(
      saleObject,
      t
        ? {
          transaction: t,
        }
        : null,
    );
    return sale;
  } catch (error) {
    throw error;
  }
};

const updateSale = async (id, saleObject, t = null) => {
  try {
    const sale = await Sales.update(
      saleObject,
      {
        where: {
          id,
        },
      },
      t
        ? {
          transaction: t,
        }
        : null,
    );

    return sale;
  } catch (error) {
    throw error;
  }
};

const findSaleById = async (id) => {
  try {
    const sale = await Sales.findByPk(id, {
      raw: true,
      nest: true,
      include: [
        {
          model: Students,
          as: 'student',
        },
      ],
    });
    return sale;
  } catch (error) {
    throw error;
  }
};

const findAllSales = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const sales = await Sales.findAndCountAll({
    where,
    offset,
    limit,
    nest: true,
    distinct: true,
    subQuery: false,
    order: [['created_at', 'desc']],
    include: [
      {
        model: Sales_items,
        as: 'products',
        include: [
          {
            model: Products,
            as: 'product',
          },
        ],
      },
      {
        model: Students,
        as: 'student',
      },
    ],
  });
  return sales;
};

const findStudentSales = async (where, page, size) => {
  page = Number(page);
  size = Number(size);
  const offset = page * size;
  const limit = size;
  const sales = await Sales.findAndCountAll({
    where,
    offset,
    limit,
    nest: true,
    distinct: true,
    subQuery: false,
    include: [
      {
        model: Sales_items,
        as: 'products',
        include: [
          {
            model: Products,
            as: 'product',
            include: [
              {
                model: Users,
                as: 'producer',
              },
              {
                model: Modules,
                as: 'module',
                include: [
                  {
                    model: Lessons,
                    as: 'lesson',
                    required: true,
                    include: [
                      {
                        model: Study_history,
                        as: 'study_history',
                        where: {
                          id_student: where.id_student,
                        },
                        required: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  return sales;
};

const findSaleByUUID = async (uuid) => {
  const sale = await Sales.findOne({
    nest: true,
    where: {
      uuid,
    },
    include: [
      {
        model: Sales_items,
        as: 'products',
        include: [
          {
            model: Products,
            as: 'product',
          },
        ],
      },
      {
        model: Students,
        as: 'student',
      },
    ],
  });
  return sale;
};

const findSaleProduct = async (id_student, id_product) => {
  const sale = await Sales.findOne({
    nest: true,
    subQuery: false,
    distinct: true,
    where: {
      id_student,
    },
    include: [
      {
        model: Sales_items,
        as: 'products',
        where: {
          id_product,
          id_status: [2],
        },
        include: [
          {
            model: Charges,
            as: 'charge',
            where: {
              payment_method: 'card',
            },
          },
        ],
      },
    ],
  });

  return sale;
};

const findSalesStudent = async (id_student, id_product) => {
  const sales = await Sales.findAll({
    subQuery: false,
    where: {
      id_student,
      '$products.product.id$': id_product,
      '$products.id_status$': findSalesStatusByKey('paid').id,
    },
    nest: true,
    include: [
      {
        model: Sales_items,
        as: 'products',
        include: [
          {
            model: Products,
            as: 'product',
            include: [
              {
                model: Products_ebooks,
                as: 'ebooks',
              },
              {
                model: Users,
                as: 'producer',
              },
              {
                model: Student_progress,
                as: 'progress',
                where: {
                  id_student,
                },
                required: false,
              },
              {
                model: Modules,
                as: 'module',
                include: [
                  {
                    model: Lessons,
                    as: 'lesson',
                    required: true,
                    include: [
                      {
                        model: Study_history,
                        as: 'study_history',
                        where: {
                          id_student,
                        },
                        required: false,
                      },
                      {
                        model: Lessons_attachments,
                        as: 'attachments',
                      },
                      {
                        model: Products_gallery,
                        as: 'video',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });
  if (sales) return sales[0];
  return sales;
};

const findSaleDelivery = async (id) =>
  Sales.findOne({
    nest: true,
    subQuery: false,
    where: { id },

    include: [
      {
        association: 'products', // sales_items
        include: [
          {
            association: 'product',
            include: [{ association: 'pixels' }],
          },
          {
            association: 'offer',
            required: false,
          },
          {
            association: 'plan',
            required: false,
          },
        ],
      },
      {
        association: 'student',
      },
    ],
  });

const findOneSale = async (where) => Sales.findOne({ where, raw: true });

module.exports = {
  createSale,
  findAllSales,
  findSaleById,
  findSaleByUUID,
  findSaleProduct,
  findSalesStudent,
  findStudentSales,
  updateSale,
  findSaleDelivery,
  findOneSale,
};
