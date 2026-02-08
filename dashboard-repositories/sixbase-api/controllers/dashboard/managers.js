const { Op } = require('sequelize');
const Affiliates = require('../../database/models/Affiliates');
const Coproductions = require('../../database/models/Coproductions');
const Managers = require('../../database/models/Managers');
const Users = require('../../database/models/Users');
const Suppliers = require('../../database/models/Suppliers');
const ApiError = require('../../error/ApiError');
const { capitalizeName } = require('../../utils/formatters');
const { findManagerStatus } = require('../../status/managersStatus');

module.exports.getCountAffiliates = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { id_manager },
  } = req;
  try {
    const manager = await Managers.findOne({
      raw: true,
      where: { id: id_manager },
      attributes: ['id_user'],
    });
    const affiliates = await Affiliates.count({
      col: 'id',
      where: {
        id_manager: +id_manager,
        id_product,
        status: [1, 2],
        id_user: { [Op.ne]: manager.id_user },
      },
    });

    return res.status(200).send({ count: affiliates });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.getManagers = async (req, res, next) => {
  const {
    product: { id: id_product, uuid },
  } = req;

  try {
    const managers = await Managers.findAll({
      nest: true,
      logging: true,
      where: { id_product },
      include: [
        {
          association: 'user',
          attributes: ['full_name', 'email'],
        },
      ],
    });
    return res.status(200).send(
      managers.map((m) => {
        const { user, ...manager } = m.toJSON();
        return {
          ...manager,
          full_name: capitalizeName(user.full_name),
          email: user.email,
          status: findManagerStatus(manager.id_status),
          product_uuid: uuid,
        };
      }),
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.createManager = async (req, res, next) => {
  const {
    product: { id: id_product },
    body: {
      id_manager,
      commission_with_affiliate,
      commission_without_affiliate,
      commission_type,
      allow_share_link,
    },
  } = req;
  try {
    const user = await Users.findOne({
      raw: true,
      attributes: ['full_name', 'email', 'id'],
      where: { id: id_manager },
    });
    if (!user) {
      throw ApiError.badRequest('Usuário não encontrado');
    }
    const isManager = await Managers.findOne({
      raw: true,
      where: { id_product, id_user: user.id, id_status: [1, 2] },
      attributes: ['id'],
    });
    if (isManager) {
      throw ApiError.badRequest('Usuário já é Gerente');
    }

    const hasACoproducer = await Coproductions.findOne({
      raw: true,
      attributes: ['id'],
      where: { id_product, id_user: user.id, status: [1, 2] },
    });

    if (hasACoproducer) {
      throw ApiError.badRequest('Coprodutor não pode ser Gerente');
    }

    const isSupplier = await Suppliers.findOne({
      raw: true,
      attributes: ['id'],
      where: { id_user: user.id, id_product, id_status: [1, 2] },
    });

    if (isSupplier) {
      throw ApiError.badRequest('Fornecedor não pode ser Gerente');
    }

    const manager = await Managers.create({
      id_user: user.id,
      id_product,
      id_status: 1,
      commission_with_affiliate,
      commission_without_affiliate,
      commission_type,
      allow_share_link,
    });

    return res.status(200).send({
      id: manager.id,
      email: user.email,
      full_name: capitalizeName(user.full_name),
      status: findManagerStatus(1),
      commission_with_affiliate,
      commission_without_affiliate,
      commission_type,
      allow_share_link,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.updateManager = async (req, res, next) => {
  const {
    body,
    params: { id_manager },
    product: { id: id_product },
  } = req;
  try {
    const manager = await Managers.findOne({
      raw: true,
      where: { id: id_manager, id_product },
      logging: true,
    });
    if (!manager) {
      throw ApiError.badRequest('Gerente não encontrado');
    }
    await Managers.update(body, { where: { id: manager.id }, logging: true });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.deleteManager = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { id_manager },
  } = req;
  try {
    const manager = await Managers.findOne({
      where: { id: id_manager, id_product },
    });
    if (!manager) {
      throw ApiError.badRequest('Gerente não encontrado');
    }
    await manager.update({ id_status: 4 });
    await Affiliates.update(
      { id_manager: null },
      { where: { id_manager: manager.id } },
    );
    return res.status(200).send({ status: findManagerStatus(4) });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.findManager = async (req, res, next) => {
  const {
    query: { email = '' },
    user: { email: userEmail },
  } = req;
  try {
    if (!email.includes('@')) {
      return res.status(200).send([]);
    }
    const users = await Users.findAll({
      raw: true,
      attributes: ['id', 'email', 'full_name'],
      where: {
        email: {
          [Op.like]: `%${email}%`,
          [Op.ne]: userEmail,
        },
      },
    });
    return res.status(200).send(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        full_name: capitalizeName(u.full_name),
      })),
    );
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};
