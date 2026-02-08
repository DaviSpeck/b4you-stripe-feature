const Verify_market = require('../models/Verify_market');

const createVerifyMarket = async (data) => Verify_market.create(data);

const updateVerifyMarket = async (where, data, t = null) =>
  Verify_market.update(data, { where, transaction: t });

const findOneVerifyMarket = async (where) => Verify_market.findOne(where);

const findVerifyMarketPaginated = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const verifys = await Verify_market.findAndCountAll({
    where,
    subQuery: false,
    include: [
      {
        association: 'users',
        required: false,
      },
      {
        association: 'products',
        required: false,
      },
    ],
    offset,
    limit,
  });
  return verifys;
};

module.exports = {
  findVerifyMarketPaginated,
  findOneVerifyMarket,
  updateVerifyMarket,
  createVerifyMarket,
};
