const jwt = require('jsonwebtoken');
const {
  findOneBackofficeUser,
  findBackofficeUserRole,
} = require('../database/controllers/users_backoffice');
const encrypter = require('../utils/helpers/encrypter');
const { findBackofficeRouteByKey } = require('../types/backofficeRoutes');
const Users_backoffice = require('../database/models/Users_backoffice');
const ApiError = require('../error/ApiError');
const {
  sendPasswordChangedEmail,
} = require('../services/email/backoffice/PasswordChanged');
const {
  sendProfileUpdatedEmail,
} = require('../services/email/backoffice/ProfileUpdated');
const Menu_items = require('../database/models/Menu_items');

const { JWT_SECRET } = process.env;

const authUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findOneBackofficeUser({ email });

    if (!user)
      return res.status(400).send({ message: 'Invalid e-mail/password! ' });

    if (!user.active) {
      return res.status(403).send({
        message:
          'Esta conta foi desativada. Entre em contato com o administrador do sistema.',
        code: 'ACCOUNT_DEACTIVATED',
        success: false,
      });
    }

    const validPassword = await encrypter.compare(password, user.password);
    if (!validPassword)
      return res.status(400).send({ message: 'Invalid e-mail/password! ' });

    let roleName = 'SEM_ROLE';
    const abilities = [];
    let roleDescription = null;

    if (user.id_role) {
      const role = await findBackofficeUserRole(user.id_role);

      if (role.name === 'MASTER') {
        roleName = role.name;
        roleDescription = role.description;
        abilities.push({ action: 'manage', subject: 'all' });
      } else if (role) {
        roleName = role.name;
        roleDescription = role.description;

        if (role.menuItems) {
          role.menuItems.forEach((menu) => {
            const route = findBackofficeRouteByKey(menu.key);
            if (route) {
              abilities.push({ action: 'manage', subject: route.subject });
            }
          });
        }

        if (role.menuActions) {
          for (const action of role.menuActions) {
            const menuItem = await Menu_items.findByPk(action.menu_item_id, {
              attributes: ['key'],
            });

            if (menuItem) {
              const route = findBackofficeRouteByKey(menuItem.key);
              if (route) {
                const subject = `${route.subject}.${action.key}`;
                abilities.push({ action: 'manage', subject });
              }
            }
          }
        }
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin,
        role: roleName,
        role_id: user.id_role,
      },
      JWT_SECRET,
      { expiresIn: 86400 * 15 }
    );

    return res.status(200).send({
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: roleName,
        role_description: roleDescription,
        abilities,
      },
      auth: true,
      accessToken: token,
      expires_in: 86400 * 15,
    });
  } catch (error) {
    console.error('[authUser]', error);
    return res.status(500).send(error);
  }
};

const authMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    const [, token] = authHeader.split(' ');

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findOneBackofficeUser({ id: decoded.id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.active) {
      return res.status(403).json({
        message: 'Usuário desativado. Entre em contato com o administrador.',
      });
    }

    let roleName = 'SEM_ROLE';
    const abilities = [];
    let roleDescription = null;

    if (user.id_role) {
      const role = await findBackofficeUserRole(user.id_role);

      if (role.name === 'MASTER') {
        roleName = role.name;
        roleDescription = role.description;
        abilities.push({ action: 'manage', subject: 'all' });
      } else if (role) {
        roleName = role.name;
        roleDescription = role.description;

        if (role.menuItems) {
          role.menuItems.forEach((menu) => {
            const route = findBackofficeRouteByKey(menu.key);
            if (route) {
              abilities.push({ action: 'manage', subject: route.subject });
            }
          });
        }

        if (role.menuActions?.length) {
          const menuIds = role.menuActions.map((a) => a.menu_item_id);
          const menuItems = await Menu_items.findAll({
            where: { id: menuIds },
            attributes: ['id', 'key'],
          });

          for (const action of role.menuActions) {
            const menuItem = menuItems.find((m) => m.id === action.menu_item_id);
            if (!menuItem) continue;

            const route = findBackofficeRouteByKey(menuItem.key);
            if (!route) continue;

            const subject = `${route.subject}.${action.key}`;
            abilities.push({ action: 'manage', subject });
          }
        }
      }
    }

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: roleName,
        role_description: roleDescription,
        abilities,
      },
    });
  } catch (err) {
    console.error('[authMe] Error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { id } = req.user;

    const user = await Users_backoffice.findByPk(id, {
      attributes: ['id', 'full_name', 'email', 'created_at'],
    });

    if (!user) {
      return next(new ApiError('Usuário não encontrado', 404));
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(new ApiError('Erro ao obter perfil', 500, error.message));
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { full_name, email } = req.body;

    if (!full_name || full_name.trim() === '') {
      return next(new ApiError('Nome completo é obrigatório', 400));
    }

    if (!email || email.trim() === '') {
      return next(new ApiError('Email é obrigatório', 400));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ApiError('Email inválido', 400));
    }

    const nameParts = full_name.trim().split(' ');
    if (nameParts.length < 2) {
      return next(new ApiError('Nome deve conter nome e sobrenome', 400));
    }

    const currentUser = await Users_backoffice.findByPk(id, {
      attributes: ['id', 'full_name', 'email'],
    });

    if (!currentUser) {
      return next(new ApiError('Usuário não encontrado', 404));
    }

    const existingUser = await Users_backoffice.findOne({
      where: {
        email: email.toLowerCase(),
        id: { [require('sequelize').Op.ne]: id },
      },
    });

    if (existingUser) {
      return next(
        new ApiError('Este email já está sendo usado por outro usuário', 409),
      );
    }

    await Users_backoffice.update(
      {
        full_name: full_name.trim(),
        email: email.toLowerCase().trim(),
      },
      {
        where: { id },
      },
    );

    const updatedUser = await Users_backoffice.findByPk(id, {
      attributes: ['id', 'full_name', 'email', 'created_at'],
    });

    const changes = [];
    if (currentUser.full_name !== updatedUser.full_name) {
      changes.push({
        field: 'Nome Completo',
        oldValue: currentUser.full_name,
        newValue: updatedUser.full_name,
      });
    }
    if (currentUser.email !== updatedUser.email) {
      changes.push({
        field: 'Email',
        oldValue: currentUser.email,
        newValue: updatedUser.email,
      });
    }

    if (changes.length > 0) {
      try {
        await sendProfileUpdatedEmail({
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          changes: changes,
        });
      } catch (emailError) {
        console.error('Erro ao enviar email de perfil atualizado:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        id: updatedUser.id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        created_at: updatedUser.created_at,
      },
    });
  } catch (error) {
    next(new ApiError('Erro ao atualizar perfil', 500, error.message));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password) {
      return next(new ApiError('Senha atual é obrigatória', 400));
    }

    if (!new_password) {
      return next(new ApiError('Nova senha é obrigatória', 400));
    }

    if (!confirm_password) {
      return next(new ApiError('Confirmação de senha é obrigatória', 400));
    }

    if (new_password !== confirm_password) {
      return next(new ApiError('Nova senha e confirmação não coincidem', 400));
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^+=\-_~`|\\/:;"'<>.,()[\]{}])[A-Za-z\d@$!%*?&#^+=\-_~`|\\/:;"'<>.,()[\]{}]{8,}$/;
    if (!passwordRegex.test(new_password)) {
      return next(
        new ApiError(
          'A nova senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo',
          400,
        ),
      );
    }

    const user = await Users_backoffice.findByPk(id);
    if (!user) {
      return next(new ApiError('Usuário não encontrado', 404));
    }

    const isValidCurrentPassword = await encrypter.compare(
      current_password,
      user.password,
    );
    if (!isValidCurrentPassword) {
      return next(new ApiError('Senha atual incorreta', 400));
    }

    const isSamePassword = await encrypter.compare(new_password, user.password);
    if (isSamePassword) {
      return next(
        new ApiError('A nova senha deve ser diferente da senha atual', 400),
      );
    }

    const hashedNewPassword = await encrypter.hash(new_password);
    await Users_backoffice.update(
      { password: hashedNewPassword },
      { where: { id } },
    );

    try {
      await sendPasswordChangedEmail({
        full_name: user.full_name,
        email: user.email,
      });
    } catch (emailError) {
      console.error('Erro ao enviar email de senha alterada:', emailError);
    }

    res.json({
      success: true,
      message: 'Senha alterada com sucesso',
    });
  } catch (error) {
    next(new ApiError('Erro ao alterar senha', 500, error.message));
  }
};

module.exports = {
  authUser,
  authMe,
  getProfile,
  updateProfile,
  changePassword,
};