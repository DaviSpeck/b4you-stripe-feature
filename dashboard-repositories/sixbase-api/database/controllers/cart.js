const Cart = require('../models/Cart');

const createCart = async (data) => Cart.create(data);

const updateCart = async (where, data, t = null) =>
  Cart.update(data, { where, transaction: t });

const findOneCart = async (where) => Cart.findOne(where);

const findOneCartWithProduct = async (where) => {
  const cart = await Cart.findOne({
    where,
    include: [{ association: 'product' }],
  });
  return cart;
};

const findAllCart = async (where) => {
  const carts = await Cart.findAll({
    where,
    include: [
      {
        association: 'sale_item',
        required: false,
        include: [
          {
            association: 'transactions',
            required: false,
            where: {
              id_type: 2,
            },
            include: [{ association: 'charge' }],
          },
        ],
      },
      { association: 'offer', required: false },
      {
        association: 'product',
        required: false,
        include: [{ association: 'producer' }],
      },
    ],
  });
  return carts;
};

const findCartsPaginated = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const carts = await Cart.findAndCountAll({
    where,
    subQuery: false,
    include: [
      {
        association: 'offer',
        required: false,
        attributes: ['uuid'],
      },
      {
        association: 'product',
        attributes: ['name', 'id_user'],
        required: false,
      },
    ],
    offset,
    limit,
  });
  return carts;
};
/**
 * @param {Object} where Ex: {id: cart.id}
 * @param {Boolean} force Soft delete = false, Hard delete = true
 */
const deleteCart = async (where, force = false, t = null) =>
  Cart.destroy({ where, force, transaction: t });

module.exports = {
  createCart,
  deleteCart,
  findAllCart,
  findOneCart,
  findCartsPaginated,
  findOneCartWithProduct,
  updateCart,
};
