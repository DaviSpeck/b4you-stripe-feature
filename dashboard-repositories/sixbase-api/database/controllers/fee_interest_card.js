const Fee_interest_card = require('../models/Fee_interest_card');

const createFeeInterestCard = async () => Fee_interest_card.create();

const updateFeeInterestCard = async (where, data) =>
  Fee_interest_card.update(data, {
    where,
  });

const findOneFeeInterestCard = async (where) =>
  Fee_interest_card.findOne({
    where,
  });

const findAllFeeInterestCard = async (where) =>
  Fee_interest_card.findAll({
    where,
  });

module.exports = {
  createFeeInterestCard,
  updateFeeInterestCard,
  findOneFeeInterestCard,
  findAllFeeInterestCard,
};
