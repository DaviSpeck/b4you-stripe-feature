const Verify_market = require('../models/Verify_market');
const Users = require('../models/Users');

const userFields = ['id', 'uuid', 'full_name', 'email'];
const createVerifyMarket = async (data) => Verify_market.create(data);

const updateVerifyMarket = async (where, data, t = null) =>
  Verify_market.update(data, { where, transaction: t });

const findOneVerifyMarket = async (where) => Verify_market.findOne(where);

const findVerifyMarketPaginated = async (where, page, size, order = null) => {
  const offset = page * size;
  const limit = Number(size);
  const verifys = await Verify_market.findAndCountAll({
    where,
    order: [['id', 'desc']],
    include: [
      {
        association: 'users',
        attributes: userFields,
      },
      {
        association: 'products',
        paranoid: false,
      },
    ],
    offset,
    limit,
  });
  return verifys;
};

const findMarketDetails = async (where) => {
  const verifys = await Verify_market.findAll({
    where,
    raw: true,
  });
  return verifys;
};

module.exports = {
  findVerifyMarketPaginated,
  findOneVerifyMarket,
  updateVerifyMarket,
  createVerifyMarket,
  findMarketDetails,
};
