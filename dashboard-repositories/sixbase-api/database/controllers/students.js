const Products = require('../models/Products');
const Sales_items = require('../models/Sales_items');
const Students = require('../models/Students');

const createStudent = async (studentObject, t = null) => {
  try {
    const student = await Students.create(
      studentObject,
      t
        ? {
            transaction: t,
          }
        : null,
    );

    return student.toJSON();
  } catch (error) {
    throw error;
  }
};

const findStudentByEmail = async (email, t = null) => {
  try {
    const student = await Students.findOne({
      raw: true,
      where: {
        email,
      },
      transaction: t,
    });

    return student;
  } catch (error) {
    throw error;
  }
};

const findStudentByUUID = async (uuid) => {
  try {
    const student = await Students.findOne({
      raw: true,
      where: {
        uuid,
      },
    });

    return student;
  } catch (error) {
    throw error;
  }
};

const findStudent = async (where) =>
  Students.findOne({
    where,
  });

const updateStudent = async (id, studentObject, t = null) => {
  const student = await Students.update(studentObject, {
    where: { id },
    transaction: t,
  });
  return student;
};

const findAllStudentsThatPurchasedProducts = async (page, size, where) => {
  const students = await Students.findAndCountAll({
    nest: true,
    distinct: true,
    include: [
      {
        model: Sales_items,
        as: 'products',
        where: {
          id_status: 2,
        },
        include: [
          {
            model: Products,
            as: 'product',
            where: {
              id_user: where.id_user,
            },
          },
        ],
      },
    ],
  });

  return students;
};

module.exports = {
  createStudent,
  findAllStudentsThatPurchasedProducts,
  findStudent,
  findStudentByEmail,
  findStudentByUUID,
  updateStudent,
};
