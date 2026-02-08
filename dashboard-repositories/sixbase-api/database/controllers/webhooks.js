const { Op } = require('sequelize');
const Webhooks = require('../models/Webhooks');
const rawData = require('../rawData');

const createWebhook = async (data) => Webhooks.create(data);

const findUserWebhooks = async (where, page, size) => {
  const offset = Number(page * size);
  const limit = Number(size);
  const webhooks = await Webhooks.findAndCountAll({
    where,
    offset,
    limit,
    include: [
      { association: 'product', attributes: ['uuid', 'name'], required: false },
    ],
  });
  return webhooks;
};

const updateWebhook = async (where, data) => {
  await Webhooks.update(data, {
    where,
  });
};

const findAllWebhooks = async ({ id_product, id_user, event_id }) => {
  const webhooks = await Webhooks.findAll({
    where: {
      id_user,
      [Op.or]: [{ id_product }, { id_product: null }],
      events: {
        [Op.like]: `%${event_id}%`,
      },
    },
  });

  if (webhooks.length > 0) return rawData(webhooks);
  return webhooks;
};

const deleteWebhook = async (where) => Webhooks.destroy({ where });

module.exports = {
  createWebhook,
  findUserWebhooks,
  updateWebhook,
  findAllWebhooks,
  deleteWebhook,
};
