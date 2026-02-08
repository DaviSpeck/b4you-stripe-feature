const Card_verification = require('../models/Card_verification');

const createCardVerification = async (data) => Card_verification.create(data);

const updateCardVerification = async (where, data) =>
  Card_verification.update(data, {
    where,
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
