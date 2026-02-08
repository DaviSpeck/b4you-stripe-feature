const { Op, Sequelize } = require('sequelize');
const ApiError = require('../error/ApiError');
const Menu_items = require('../database/models/Menu_items');
const Backoffice_roles = require('../database/models/Backoffice_roles');

module.exports.listMenus = async (req, res, next) => {
  try {
    const menus = await Menu_items.findAll({
      include: [
        {
          model: Backoffice_roles,
          as: 'roles',
          attributes: ['id', 'name', 'description'],
          through: { attributes: [] },
        },
      ],
      attributes: ['id', 'key', 'route', 'created_at'],
      order: [['key', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: menus,
    });
  } catch (error) {
    return next(ApiError.internal('Erro ao listar menus', error.message));
  }
};

module.exports.createMenu = async (req, res, next) => {
  try {
    const { key, route } = req.body;

    if (!key || !route) {
      throw ApiError.badRequest('Key e route são obrigatórios');
    }

    const normalizedKey = key.trim().toLowerCase();
    const normalizedRoute = route.trim().toLowerCase();

    const [existingMenu, existingRoute] = await Promise.all([
      Menu_items.findOne({
        where: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('key')),
          normalizedKey
        ),
      }),
      Menu_items.findOne({
        where: Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('route')),
          normalizedRoute
        ),
      }),
    ]);

    if (existingMenu) throw ApiError.conflict('Já existe um item de menu com esta key');
    if (existingRoute) throw ApiError.conflict('Já existe um item de menu com esta rota');

    const menu = await Menu_items.create({ key: normalizedKey, route: normalizedRoute });

    return res.status(201).json({
      success: true,
      message: 'Item de menu criado com sucesso',
      data: menu,
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(ApiError.conflict('Key ou rota já existem'));
    }
    return next(ApiError.internal('Erro ao criar item de menu', error.message));
  }
};

module.exports.updateMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { key, route } = req.body;

    if (!key || !route) {
      throw ApiError.badRequest('Key e route são obrigatórios');
    }

    const menu = await Menu_items.findByPk(id);
    if (!menu) throw ApiError.notFound('Item de menu não encontrado');

    const normalizedKey = key.trim().toLowerCase();
    const normalizedRoute = route.trim().toLowerCase();

    const [existingMenu, existingRoute] = await Promise.all([
      Menu_items.findOne({
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('key')),
              normalizedKey
            ),
            { id: { [Op.ne]: id } },
          ],
        },
      }),
      Menu_items.findOne({
        where: {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn('LOWER', Sequelize.col('route')),
              normalizedRoute
            ),
            { id: { [Op.ne]: id } },
          ],
        },
      }),
    ]);

    if (existingMenu) throw ApiError.conflict('Já existe um item de menu com esta key');
    if (existingRoute) throw ApiError.conflict('Já existe um item de menu com esta rota');

    await menu.update({ key: normalizedKey, route: normalizedRoute });

    return res.status(200).json({
      success: true,
      message: 'Item de menu atualizado com sucesso',
      data: menu,
    });
  } catch (error) {
    return next(ApiError.internal('Erro ao atualizar item de menu', error.message));
  }
};

module.exports.deleteMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menu = await Menu_items.findByPk(id);
    if (!menu) throw ApiError.notFound('Item de menu não encontrado');

    await menu.destroy();

    return res.status(200).json({
      success: true,
      message: 'Item de menu removido com sucesso',
    });
  } catch (error) {
    return next(ApiError.internal('Erro ao remover item de menu', error.message));
  }
};
