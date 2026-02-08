const { Op } = require('sequelize');
const Products = require('../models/Products');
const Student_products = require('../models/Students_products');
const Users = require('../models/Users');
const rawData = require('../rawData');
const { PAYMENT_ONLY_TYPE } = require('../../types/productTypes');

const createStudentProducts = (data, t = null) =>
  Student_products.create(data, { transaction: t });

const findStudentProductsCoursePaginated = async (where, page, size) => {
  const factor = parseInt(page, 10);
  const limit = parseInt(size, 10);
  const offset = factor * limit;
  const studentProducts = await Student_products.findAndCountAll({
    nest: true,
    limit,
    offset,
    where,
    distinct: true,
    subQuery: false,
    order: [['id', 'desc']],
    include: [
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
  return studentProducts;
};

const findStudentProductsPaginated = async ({
  page,
  size,
  id_product,
  class_uuid,
  input,
}) => {
  const offset = Number(page) * Number(size);
  const limit = Number(size);
  let where = {};
  if (id_product) where.id_product = id_product;
  if (input) {
    let orObject = {
      '$student.full_name$': { [Op.like]: `%${input}%` },
      '$student.email$': { [Op.like]: `%${input}%` },
    };
    const sanitizedInput = input.replace(/[^\d]/g, '');
    if (sanitizedInput.length > 0) {
      orObject = {
        ...orObject,
        '$student.whatsapp$': { [Op.like]: `%${sanitizedInput}%` },
        '$student.document_number$': { [Op.like]: `%${sanitizedInput}%` },
      };
    }
    where = {
      ...where,
      [Op.or]: orObject,
    };
  }
  if (class_uuid) {
    where = {
      ...where,
      '$classroom.uuid$': class_uuid,
    };
  }

  const studentProducts = await Student_products.findAndCountAll({
    nest: true,
    limit,
    offset,
    where,
    distinct: true,
    group: ['id_student'],
    subQuery: false,
    include: [
      {
        association: 'student',
      },
      {
        association: 'classroom',
      },
    ],
  });

  return {
    count: studentProducts.count,
    rows:
      studentProducts.count.length > 0
        ? rawData(studentProducts.rows)
        : studentProducts.rows,
  };
};

const findStudentProduct = async (where, id_student) => {
  const studentProducts = await Student_products.findOne({
    nest: true,
    where,
    subQuery: false,
    include: [
      {
        association: 'product',
        paranoid: false,
        include: [
          {
            association: 'ebooks',
            separate: true,
          },
          {
            association: 'producer',
          },
          {
            association: 'progress',
            where: {
              id_student,
            },
            required: false,
          },
          {
            association: 'anchors',
            order: [['order', 'asc']],
            separate: true,
            include: [
              {
                association: 'modules',
                attributes: ['id'],
              },
            ],
          },
        ],
      },
    ],
  });
  return studentProducts;
};

const updateStudentProducts = async (where, data, t = null) =>
  Student_products.findOne({ where }).then(async (result) => {
    if (result) {
      await result.update(data, { transaction: t });
    }
  });

const findSingleStudentProduct = async (where) =>
  Student_products.findOne({
    raw: true,
    where,
  });

const findAllStudentProducts = async (where, t = null) =>
  Student_products.findAll({
    raw: true,
    where,
    transaction: t,
  });

const findStudentProductDesc = async (where) =>
  Student_products.findOne({
    order: [['id', 'desc']],
    where,
    include: [
      {
        association: 'product',
        paranoid: false,
        where: {
          id_type: { [Op.ne]: PAYMENT_ONLY_TYPE },
        },
        include: [
          {
            required: false,
            association: 'ebooks',
          },
        ],
      },
    ],
  });

const deleteStudentProduct = async (where, t = null) =>
  Student_products.destroy({
    where,
    transaction: t,
  });

module.exports = {
  createStudentProducts,
  findAllStudentProducts,
  findSingleStudentProduct,
  findStudentProductsCoursePaginated,
  findStudentProductsPaginated,
  findStudentProduct,
  updateStudentProducts,
  deleteStudentProduct,
  findStudentProductDesc,
};
