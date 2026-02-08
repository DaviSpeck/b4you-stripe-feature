const Card_verification = require('../models/Card_verification');

const createCardVerification = async (data, t = null) =>
  Card_verification.create(data, { transaction: t });

const updateCardVerification = async (where, data, t = null) =>
  Card_verification.update(data, {
    where,
    transaction: t,
  });

const findOneVerificationCard = async (where) =>
  Card_verification.findOne({
    where,
  });

module.exports = {
  createCardVerification,
  updateCardVerification,
  findOneVerificationCard,
};
