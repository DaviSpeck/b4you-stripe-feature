const Menu_actions = require('../database/models/Menu_actions');
const Menu_items = require('../database/models/Menu_items');
const Backoffice_roles = require('../database/models/Backoffice_roles');
const Menu_actions_roles = require('../database/models/Menu_actions_roles');
const ApiError = require('../error/ApiError');
const { createLogBackoffice } = require('../database/controllers/logs_backoffice');
const { findUserEventTypeByKey } = require('../types/userEvents');

module.exports = {
    async list(req, res, next) {
        try {
            const actions = await Menu_actions.findAll({
                include: [
                    {
                        model: Menu_items,
                        as: 'menuItem',
                        attributes: ['id', 'key', 'route'],
                    },
                    {
                        model: Backoffice_roles,
                        as: 'roles',
                        attributes: ['id', 'name'],
                    },
                ],
                order: [['menu_item_id', 'ASC'], ['key', 'ASC']],
            });

            res.json({ success: true, data: actions });
        } catch (error) {
            next(new ApiError('Erro ao listar ações', 500, error.message));
        }
    },

    async create(req, res, next) {
        try {
            const { menu_item_id, key, label, description } = req.body;
            const id_user_backoffice = req.user?.id;
            const ip_address = req.ip;

            if (!menu_item_id || !key || !label) {
                return next(
                    new ApiError('Campos obrigatórios: menu_item_id, key e label', 400)
                );
            }

            const exists = await Menu_actions.findOne({
                where: { menu_item_id, key },
            });

            if (exists) {
                return next(new ApiError('Já existe essa ação neste menu', 409));
            }

            const menu = await Menu_items.findByPk(menu_item_id);
            if (!menu) {
                return next(new ApiError('Menu não encontrado', 404));
            }

            const action = await Menu_actions.create({
                menu_item_id,
                key,
                label,
                description,
                created_at: new Date(),
                updated_at: new Date(),
            });

            await createLogBackoffice({
                id_user_backoffice,
                id_event: findUserEventTypeByKey('create-menu-action').id,
                params: {
                    menu_id: menu.id,
                    menu_key: menu.key,
                    action_id: action.id,
                    action_key: key,
                    action_label: label,
                },
                ip_address,
            });

            res.status(201).json({ success: true, data: action });
        } catch (error) {
            next(new ApiError('Erro ao criar ação', 500, error.message));
        }
    },

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const { key, label, description } = req.body;
            const id_user_backoffice = req.user?.id;
            const ip_address = req.ip;

            const action = await Menu_actions.findByPk(id, {
                include: [{ model: Menu_items, as: 'menuItem', attributes: ['id', 'key'] }],
            });

            if (!action) {
                return next(new ApiError('Ação não encontrada', 404));
            }

            const updatedAction = await action.update({
                key,
                label,
                description,
                updated_at: new Date(),
            });

            await createLogBackoffice({
                id_user_backoffice,
                id_event: findUserEventTypeByKey('update-menu-action').id,
                params: {
                    menu_id: action.menuItem.id,
                    menu_key: action.menuItem.key,
                    action_id: action.id,
                    action_key: key,
                    action_label: label,
                },
                ip_address,
            });

            res.json({ success: true, data: updatedAction });
        } catch (error) {
            next(new ApiError('Erro ao atualizar ação', 500, error.message));
        }
    },

    async remove(req, res, next) {
        try {
            const { id } = req.params;
            const id_user_backoffice = req.user?.id;
            const ip_address = req.ip;

            const action = await Menu_actions.findByPk(id, {
                include: [{ model: Menu_items, as: 'menuItem', attributes: ['id', 'key'] }],
            });

            if (!action) {
                return next(new ApiError('Ação não encontrada', 404));
            }

            await action.destroy();

            await createLogBackoffice({
                id_user_backoffice,
                id_event: findUserEventTypeByKey('delete-menu-action').id,
                params: {
                    menu_id: action.menuItem.id,
                    menu_key: action.menuItem.key,
                    action_id: action.id,
                    action_key: action.key,
                    action_label: action.label,
                },
                ip_address,
            });

            res.json({ success: true, message: 'Ação removida com sucesso' });
        } catch (error) {
            next(new ApiError('Erro ao remover ação', 500, error.message));
        }
    },

    async linkRoles(req, res, next) {
        try {
            const { actionId, roleIds } = req.body;
            const id_user_backoffice = req.user?.id;
            const ip_address = req.ip;

            if (!actionId || !Array.isArray(roleIds)) {
                return next(new ApiError('Campos obrigatórios: actionId e roleIds[]', 400));
            }

            const action = await Menu_actions.findByPk(actionId);
            if (!action) {
                return next(new ApiError('Ação não encontrada', 404));
            }

            await Menu_actions_roles.destroy({ where: { menu_action_id: actionId } });

            const links = roleIds.map(roleId => ({
                menu_action_id: actionId,
                role_id: roleId,
                created_at: new Date(),
                updated_at: new Date(),
            }));
            await Menu_actions_roles.bulkCreate(links);

            await createLogBackoffice({
                id_user_backoffice,
                id_event: findUserEventTypeByKey('update-action-roles').id,
                params: {
                    action_id: action.id,
                    action_key: action.key,
                    roles_assigned: roleIds,
                },
                ip_address,
            });

            res.json({ success: true, message: 'Roles vinculadas à ação com sucesso' });
        } catch (error) {
            next(new ApiError('Erro ao vincular roles à ação', 500, error.message));
        }
    },

    async getRoles(req, res, next) {
        try {
            const { id } = req.params;

            const action = await Menu_actions.findByPk(id, {
                include: [{ model: Backoffice_roles, as: 'roles', attributes: ['id', 'name'] }],
            });

            if (!action) {
                return next(new ApiError('Ação não encontrada', 404));
            }

            res.json({ success: true, data: action.roles });
        } catch (error) {
            next(new ApiError('Erro ao listar roles da ação', 500, error.message));
        }
    },
};