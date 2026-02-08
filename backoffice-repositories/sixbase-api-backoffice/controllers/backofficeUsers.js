const { Op, Sequelize } = require('sequelize');
const ApiError = require('../error/ApiError');
const Users_backoffice = require('../database/models/Users_backoffice');
const Backoffice_roles = require('../database/models/Backoffice_roles');
const {
  createLogBackoffice,
} = require('../database/controllers/logs_backoffice');
const { findUserEventTypeByKey } = require('../types/userEvents');
const dateHelper = require('../utils/helpers/date');
const Encrypter = require('../utils/helpers/encrypter');
const {
  sendUserCreatedEmail,
} = require('../services/email/backoffice/UserCreated');
const {
  sendUserDeactivatedEmail,
} = require('../services/email/backoffice/UserDeactivated');
const {
  sendUserReactivatedEmail,
} = require('../services/email/backoffice/UserReactivated');

module.exports.createUser = async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      id_role,
      is_admin = false,
    } = req.body;
    const { id: id_user_backoffice } = req.user;
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!full_name || !email || !phone || !password || !id_role) {
      return next(
        new ApiError(
          'Nome, email, telefone, senha e role são obrigatórios',
          400,
        ),
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError('Formato de email inválido', 400));
    }

    const phoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return next(
        new ApiError(
          'Formato de telefone inválido. Use o formato: (11) 99999-9999 ou +55 11 99999-9999',
          400,
        ),
      );
    }

    const existingUser = await Users_backoffice.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return next(new ApiError('Email já está em uso', 409));
    }

    const role = await Backoffice_roles.findByPk(id_role);
    if (!role) {
      return next(new ApiError('Role não encontrada', 404));
    }

    const newUser = await Users_backoffice.create({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: password,
      id_role: id_role,
      is_admin: is_admin,
      active: true,
    });

    await createLogBackoffice({
      id_user_backoffice,
      id_event: findUserEventTypeByKey('create-user').id,
      params: {
        new_user_id: newUser.id,
        new_user_email: newUser.email,
        new_user_name: newUser.full_name,
        new_user_phone: newUser.phone,
        new_user_role_id: newUser.id_role,
        is_admin: newUser.is_admin,
      },
      ip_address,
    });

    const createdUser = await Users_backoffice.findByPk(newUser.id, {
      include: [
        {
          model: Backoffice_roles,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: [
        'id',
        'full_name',
        'email',
        'phone',
        'active',
        'created_at',
        'id_role',
        'is_admin',
      ],
    });

    try {
      await sendUserCreatedEmail({
        full_name: createdUser.full_name,
        email: createdUser.email,
        password: password,
        role_name: createdUser.role?.name || 'Sem perfil definido',
      });
    } catch (emailError) {
      console.error('Erro ao enviar email de cadastro:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        ...createdUser.toJSON(),
        formatted_created_at: dateHelper(createdUser.created_at).format(
          'DD/MM/YYYY HH:mm:ss',
        ),
        created_at_timestamp: dateHelper(createdUser.created_at).valueOf(),
      },
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    next(new ApiError('Erro ao criar usuário', 500, error.message));
  }
};

module.exports.listUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role_id = null,
      active = null,
      start_date = null,
      end_date = null,
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {};

    if (search && search.trim() !== '') {
      whereClause[Op.or] = [
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('users_backoffice.full_name')),
          Op.like,
          `%${search.toLowerCase()}%`,
        ),
        Sequelize.where(
          Sequelize.fn('LOWER', Sequelize.col('users_backoffice.email')),
          Op.like,
          `%${search.toLowerCase()}%`,
        ),
      ];
    }

    if (role_id) {
      whereClause.id_role = role_id;
    }

    if (active !== null && active !== '') {
      whereClause.active = active === 'true';
    }

    if (start_date && end_date) {
      const startDate = dateHelper(start_date).startOf('day').utc().toDate();
      const endDate = dateHelper(end_date).endOf('day').utc().toDate();
      whereClause.created_at = {
        [Op.between]: [startDate, endDate],
      };
    } else if (start_date) {
      const startDate = dateHelper(start_date).startOf('day').utc().toDate();
      whereClause.created_at = {
        [Op.gte]: startDate,
      };
    } else if (end_date) {
      const endDate = dateHelper(end_date).endOf('day').utc().toDate();
      whereClause.created_at = {
        [Op.lte]: endDate,
      };
    }

    const { count, rows: users } = await Users_backoffice.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Backoffice_roles,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: [
        'id',
        'full_name',
        'email',
        'phone',
        'active',
        'created_at',
        'id_role',
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(count / limit);

    const formattedUsers = users.map((user) => ({
      ...user.toJSON(),
      formatted_created_at: dateHelper(user.created_at).format(
        'DD/MM/YYYY HH:mm:ss',
      ),
      created_at_timestamp: dateHelper(user.created_at).valueOf(),
    }));

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error in listUsers:', error);
    next(new ApiError('Erro ao listar usuários', 500, error.message));
  }
};

module.exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;
    const { id: id_user_backoffice } = req.user;
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!role_id) {
      return next(new ApiError('ID da role é obrigatório', 400));
    }

    if (parseInt(id) === id_user_backoffice) {
      return next(new ApiError('Você não pode alterar sua própria role', 403));
    }

    const role = await Backoffice_roles.findByPk(role_id);
    if (!role) {
      return next(new ApiError('Role não encontrada', 404));
    }

    const user = await Users_backoffice.findByPk(id);
    if (!user) {
      return next(new ApiError('Usuário não encontrado', 404));
    }

    const oldRoleId = user.id_role;

    await user.update({ id_role: role_id });

    const oldRole = await Backoffice_roles.findByPk(oldRoleId);
    const newRole = await Backoffice_roles.findByPk(role_id);

    await createLogBackoffice({
      id_user_backoffice,
      id_event: findUserEventTypeByKey('update-user-role').id,
      params: {
        user_id: id,
        old_role_id: oldRoleId,
        new_role_id: role_id,
        old_role_name: oldRole?.name || 'Desconhecida',
        new_role_name: newRole?.name || 'Desconhecida',
        user_email: user.email,
        user_name: user.full_name,
      },
      ip_address,
    });

    const updatedUser = await Users_backoffice.findByPk(id, {
      include: [
        {
          model: Backoffice_roles,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: [
        'id',
        'full_name',
        'email',
        'phone',
        'active',
        'created_at',
        'id_role',
      ],
    });

    res.json({
      success: true,
      message: 'Role do usuário atualizada com sucesso',
      data: {
        ...updatedUser.toJSON(),
        formatted_created_at: dateHelper(updatedUser.created_at).format(
          'DD/MM/YYYY HH:mm:ss',
        ),
        created_at_timestamp: dateHelper(updatedUser.created_at).valueOf(),
      },
    });
  } catch (error) {
    next(new ApiError('Erro ao atualizar role do usuário', 500, error.message));
  }
};

module.exports.getDefaultPassword = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const defaultPassword = `B4you@${currentYear}`;

    res.json({
      success: true,
      data: {
        default_password: defaultPassword,
        year: currentYear,
      },
    });
  } catch (error) {
    console.error('Error in getDefaultPassword:', error);
    next(new ApiError('Erro ao gerar senha padrão', 500, error.message));
  }
};

module.exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const { id: id_user_backoffice } = req.user;
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (typeof active !== 'boolean') {
      return next(new ApiError('Status deve ser um valor booleano', 400));
    }

    if (parseInt(id) === id_user_backoffice) {
      return next(
        new ApiError('Você não pode alterar seu próprio status', 403),
      );
    }

    const user = await Users_backoffice.findByPk(id);
    if (!user) {
      return next(new ApiError('Usuário não encontrado', 404));
    }

    const oldStatus = user.active;

    await user.update({ active });

    await createLogBackoffice({
      id_user_backoffice,
      id_event: findUserEventTypeByKey('update-user-status').id,
      params: {
        user_id: id,
        old_status: oldStatus,
        new_status: active,
        user_email: user.email,
        user_name: user.full_name,
      },
      ip_address,
    });

    const updatedUser = await Users_backoffice.findByPk(id, {
      include: [
        {
          model: Backoffice_roles,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
      attributes: [
        'id',
        'full_name',
        'email',
        'phone',
        'active',
        'created_at',
        'id_role',
      ],
    });

    const adminUser = await Users_backoffice.findByPk(id_user_backoffice, {
      attributes: ['full_name'],
    });

    try {
      if (active && !oldStatus) {
        await sendUserReactivatedEmail({
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          reactivated_by: adminUser?.full_name || 'Administrador',
        });
      } else if (!active && oldStatus) {
        await sendUserDeactivatedEmail({
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          deactivated_by: adminUser?.full_name || 'Administrador',
        });
      }
    } catch (emailError) {
      console.error('Erro ao enviar email de status:', emailError);
    }

    res.json({
      success: true,
      message: `Usuário ${active ? 'ativado' : 'desativado'} com sucesso`,
      data: {
        ...updatedUser.toJSON(),
        formatted_created_at: dateHelper(updatedUser.created_at).format(
          'DD/MM/YYYY HH:mm:ss',
        ),
        created_at_timestamp: dateHelper(updatedUser.created_at).valueOf(),
      },
    });
  } catch (error) {
    next(
      new ApiError('Erro ao atualizar status do usuário', 500, error.message),
    );
  }
};
