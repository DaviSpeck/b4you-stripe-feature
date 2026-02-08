const { Op } = require('sequelize');
const ApiError = require('../error/ApiError');
const Backoffice_roles = require('../database/models/Backoffice_roles');
const Menu_items = require('../database/models/Menu_items');
const Users_backoffice = require('../database/models/Users_backoffice');
const models = require('../database/models');
const dateHelper = require('../utils/helpers/date');

module.exports.listRoles = async (req, res, next) => {
  try {
    const roles = await Backoffice_roles.findAll({
      include: [
        {
          model: Menu_items,
          as: 'menuItems',
          attributes: ['id', 'key', 'route'],
          through: { attributes: [] },
        },
      ],
      attributes: ['id', 'name', 'description', 'created_at'],
      order: [['created_at', 'DESC']],
    });

    const formattedRoles = roles.map((role) => ({
      ...role.toJSON(),
      formatted_created_at: dateHelper(role.created_at).format(
        'DD/MM/YYYY HH:mm:ss',
      ),
      created_at_timestamp: dateHelper(role.created_at).valueOf(),
    }));

    res.json({
      success: true,
      data: formattedRoles,
    });
  } catch (error) {
    next(new ApiError('Erro ao listar roles', 500, error.message));
  }
};

module.exports.createRole = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return next(new ApiError('Nome e descrição são obrigatórios', 400));
    }

    const existingRole = await Backoffice_roles.findOne({
      where: { name: { [Op.like]: name.toLowerCase() } },
    });

    if (existingRole) {
      return next(new ApiError('Já existe uma role com este nome', 409));
    }

    const role = await Backoffice_roles.create({
      name,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Role criada com sucesso',
      data: {
        ...role.toJSON(),
        formatted_created_at: dateHelper(role.created_at).format(
          'DD/MM/YYYY HH:mm:ss',
        ),
        created_at_timestamp: dateHelper(role.created_at).valueOf(),
      },
    });
  } catch (error) {
    next(new ApiError('Erro ao criar role', 500, error.message));
  }
};

module.exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return next(new ApiError('Nome e descrição são obrigatórios', 400));
    }

    const role = await Backoffice_roles.findByPk(id);
    if (!role) {
      return next(new ApiError('Role não encontrada', 404));
    }

    const existingRole = await Backoffice_roles.findOne({
      where: {
        name: { [Op.like]: name.toLowerCase() },
        id: { [Op.ne]: id },
      },
    });

    if (existingRole) {
      return next(new ApiError('Já existe uma role com este nome', 409));
    }

    await role.update({ name, description });

    res.json({
      success: true,
      message: 'Role atualizada com sucesso',
      data: {
        ...role.toJSON(),
        formatted_created_at: dateHelper(role.created_at).format(
          'DD/MM/YYYY HH:mm:ss',
        ),
        created_at_timestamp: dateHelper(role.created_at).valueOf(),
      },
    });
  } catch (error) {
    next(new ApiError('Erro ao atualizar role', 500, error.message));
  }
};

module.exports.deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await Backoffice_roles.findByPk(id);
    if (!role) {
      return next(new ApiError('Role não encontrada', 404));
    }

    const usersWithRole = await Users_backoffice.count({
      where: { id_role: id },
    });

    if (usersWithRole > 0) {
      return next(
        new ApiError(
          'Não é possível excluir uma role que possui usuários associados',
          409,
        ),
      );
    }

    await role.destroy();

    res.json({
      success: true,
      message: 'Role removida com sucesso',
    });
  } catch (error) {
    next(new ApiError('Erro ao remover role', 500, error.message));
  }
};

module.exports.updateRoleMenus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { menu_ids } = req.body;

    if (!Array.isArray(menu_ids)) {
      return next(new ApiError('menu_ids deve ser um array', 400));
    }

    const role = await Backoffice_roles.findByPk(id);
    if (!role) {
      return next(new ApiError('Role não encontrada', 404));
    }

    if (menu_ids.length > 0) {
      const existingMenus = await Menu_items.findAll({
        where: { id: menu_ids },
        attributes: ['id'],
      });

      if (existingMenus.length !== menu_ids.length) {
        return next(
          new ApiError('Um ou mais menus não foram encontrados', 404),
        );
      }
    }

    await role.setMenuItems(menu_ids);

    const updatedRole = await Backoffice_roles.findByPk(id, {
      include: [
        {
          model: Menu_items,
          as: 'menuItems',
          attributes: ['id', 'key', 'route'],
          through: { attributes: [] },
        },
      ],
      attributes: ['id', 'name', 'description', 'created_at'],
    });

    res.json({
      success: true,
      message: 'Menus da role atualizados com sucesso',
      data: {
        ...updatedRole.toJSON(),
        formatted_created_at: dateHelper(updatedRole.created_at).format(
          'DD/MM/YYYY HH:mm:ss',
        ),
        created_at_timestamp: dateHelper(updatedRole.created_at).valueOf(),
      },
    });
  } catch (error) {
    next(new ApiError('Erro ao atualizar menus da role', 500, error.message));
  }
};

module.exports.updateRoleActions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action_ids } = req.body;

    if (!Array.isArray(action_ids)) {
      return next(new ApiError('action_ids deve ser um array', 400));
    }

    const role = await db.backoffice_roles.findByPk(id);
    if (!role) {
      return next(new ApiError('Role não encontrada', 404));
    }

    await role.setMenuActions(action_ids);

    const updated = await db.backoffice_roles.findByPk(id, {
      include: [
        { model: db.menu_actions, as: 'menuActions', attributes: ['id', 'key', 'label'] },
      ],
    });

    res.json({
      success: true,
      message: 'Ações da role atualizadas com sucesso',
      data: updated,
    });
  } catch (error) {
    next(new ApiError('Erro ao atualizar ações da role', 500, error.message));
  }
};