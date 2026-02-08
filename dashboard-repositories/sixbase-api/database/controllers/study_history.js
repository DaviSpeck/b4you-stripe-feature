const { Op } = require('sequelize');
const Study_history = require('../models/Study_history');
const { PAYMENT_ONLY_TYPE } = require('../../types/productTypes');

const findStudentStudyHistoryDesc = async (where) =>
  Study_history.findOne({
    order: [['updated_at', 'desc']],
    where,
    include: [
      {
        association: 'product',
        where: {
          id_type: { [Op.ne]: { PAYMENT_ONLY_TYPE } },
        },
      },
    ],
  });

module.exports = {
  findStudentStudyHistoryDesc,
};
