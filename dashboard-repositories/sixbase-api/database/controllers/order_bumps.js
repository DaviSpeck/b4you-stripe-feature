const OrderBumps = require('../models/Order_bumps');
const Products = require('../models/Products');
const Classrooms = require('../models/Classrooms');

const createOrderBump = async (data) => OrderBumps.create(data);

const updateOrderBump = async (data, where) =>
  OrderBumps.update(data, { where });

const deleteOrderBump = async (where) => OrderBumps.destroy({ where });

const findOneOrderBump = async (where) =>
  OrderBumps.findOne({
    nest: true,
    where,
    include: [
      {
        association: 'offer',
        include: [
          {
            model: Products,
            as: 'offer_product',
          },
          {
            model: Classrooms,
            as: 'classroom',
          },
        ],
      },
    ],
  });

const findAllOrderBumps = async (where) =>
  OrderBumps.findAll({
    nest: true,
    where,
    include: [
      {
        association: 'offer',
        include: [
          {
            model: Products,
            as: 'offer_product',
          },
          {
            model: Classrooms,
            as: 'classroom',
          },
        ],
      },
    ],
  });

const updateOrderBumpImage = async (id, obj) => {
  const orderBump = await OrderBumps.update(obj, {
    where: { id },
  });

  return orderBump;
};

module.exports = {
  createOrderBump,
  updateOrderBump,
  deleteOrderBump,
  findOneOrderBump,
  findAllOrderBumps,
  updateOrderBumpImage,
};
