const Users_backoffice = require('../models/Users_backoffice');
const Backoffice_roles = require('../models/Backoffice_roles');
const Menu_items = require('../models/Menu_items');
const Menu_actions = require('../models/Menu_actions');

const createBackofficeUser = async (data) => Users_backoffice.create(data);

const findOneBackofficeUser = async (where = {}) => {
  const queryOptions = { where };
  return Users_backoffice.findOne(queryOptions);
};

const findBackUsersPaginated = async (where, page, size) => {
  const offset = page * size;
  const limit = Number(size);
  const users = await Users_backoffice.findAndCountAll({
    where,
    offset,
    limit,
  });
  return users;
};

const findBackUsers = async (where) => {
  const users = await Users_backoffice.findAndCountAll({
    where,
  });
  return users;
};

/**
 * Retorna a role com os menus e ações vinculadas
 */
const findBackofficeUserRole = async (roleId) =>
  Backoffice_roles.findOne({
    where: { id: roleId },
    include: [
      {
        model: Menu_items,
        as: 'menuItems',
        through: { attributes: [] },
        attributes: ['key'],
      },
      {
        model: Menu_actions,
        as: 'menuActions',
        through: { attributes: [] },
        attributes: ['key', 'menu_item_id'],
      },
    ],
  });

module.exports = {
  createBackofficeUser,
  findOneBackofficeUser,
  findBackUsersPaginated,
  findBackUsers,
  findBackofficeUserRole,
};