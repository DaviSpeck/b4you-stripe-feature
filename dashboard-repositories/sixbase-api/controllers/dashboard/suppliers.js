const { Op } = require('sequelize');
const Product_offer = require('../../database/models/Product_offer');
const Users = require('../../database/models/Users');
const Suppliers = require('../../database/models/Suppliers');
const Coproductions = require('../../database/models/Coproductions');
const Affiliates = require('../../database/models/Affiliates');
const ApiError = require('../../error/ApiError');
const { capitalizeName } = require('../../utils/formatters');
const { findSupplierStatus } = require('../../status/suppliersStatus');
const Managers = require('../../database/models/Managers');
const Suppliers_Product = require('../../database/models/Suppliers_Product');

module.exports.createSupplier = async (req, res, next) => {
  const {
    product: { id: id_product },
    body: { amount, id_supplier, receives_shipping_amount },
    offer_id,
  } = req;
  try {
    const offer = await Product_offer.findOne({
      raw: true,
      where: { uuid: offer_id, id_product },
      attributes: ['id'],
    });
    if (!offer) {
      throw ApiError.badRequest('Oferta não encontrada');
    }
    const user = await Users.findOne({
      raw: true,
      where: { id: id_supplier, active: 1 },
      attributes: ['id', 'full_name', 'email'],
    });
    if (!user) {
      throw ApiError.badRequest('Usuário não encontrado');
    }
    const alreadyHasASupplier = await Suppliers.findOne({
      raw: true,
      where: { id_user: user.id, id_status: [1, 2], id_offer: offer.id },
    });
    if (alreadyHasASupplier) {
      throw ApiError.badRequest('Fornecedor já cadastrado');
    }

    const hasACoproducer = await Coproductions.findOne({
      raw: true,
      attributes: ['id'],
      where: { id_product, id_user: user.id, status: [1, 2] },
    });

    if (hasACoproducer) {
      throw ApiError.badRequest('Coprodutor não pode ser fornecedor');
    }

    const hasAnAffiliate = await Affiliates.findOne({
      raw: true,
      attributes: ['id'],
      where: { id_user: user.id, id_product, status: [1, 2, 3] },
    });

    if (hasAnAffiliate) {
      throw ApiError.badRequest('Afiliado não pode ser fornecedor');
    }

    const isManager = await Managers.findOne({
      raw: true,
      attributes: ['id'],
      where: { id_user: user.id, id_product, id_status: [1, 2] },
    });

    if (isManager) {
      throw ApiError.badRequest('Gerente não pode ser fornecedor');
    }

    const supplier = await Suppliers.create({
      id_user: user.id,
      id_status: 1,
      id_product,
      id_offer: offer.id,
      amount,
      receives_shipping_amount,
    });
    return res.status(200).send({
      id: supplier.id,
      amount,
      receives_shipping_amount,
      email: user.email,
      name: capitalizeName(user.full_name),
      status: findSupplierStatus(1),
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

module.exports.updateSupplier = async (req, res, next) => {
  const {
    product: { id: id_product },
    body: { amount, receives_shipping_amount },
    params: { id_supplier },
  } = req;
  try {
    const supplier = await Suppliers.findOne({
      raw: true,
      where: { id: id_supplier, id_product },
    });
    if (!supplier) {
      throw ApiError.badRequest('Fornecedor não encontrado');
    }
    await Suppliers.update(
      { amount, receives_shipping_amount },
      { where: { id: id_supplier } },
    );
    return res.status(200).send({
      id: supplier.id,
      amount,
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

module.exports.deleteSupplier = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { id_supplier },
  } = req;
  try {
    const supplier = await Suppliers.findOne({
      raw: true,
      where: { id: id_supplier, id_product },
    });
    if (!supplier) {
      throw ApiError.badRequest('Fornecedor não encontrado');
    }
    await Suppliers.destroy({ where: { id: id_supplier } });
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

module.exports.getSuppliers = async (req, res, next) => {
  const { offer_id } = req;

  try {
    const offer = await Product_offer.findOne({
      raw: true,
      where: { uuid: offer_id },
      attributes: ['id'],
    });

    const suppliers = await Suppliers.findAll({
      nest: true,
      where: { id_offer: offer.id },
      include: [
        {
          association: 'user',
          attributes: ['full_name', 'email'],
        },
      ],
    });

    return res.status(200).send(
      suppliers.map((s) => ({
        id: s.id,
        amount: s.amount,
        email: s.user.email,
        receives_shipping_amount: s.receives_shipping_amount,
        name: capitalizeName(s.user.full_name),
        status: findSupplierStatus(s.id_status),
      })),
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

module.exports.findUserSupplier = async (req, res, next) => {
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

module.exports.createSupplierProductDefault = async (req, res, next) => {
  const {
    product: { id: id_product },
    body: { amount, id_supplier, receives_shipping_amount },
  } = req;

  try {
    const user = await Users.findOne({
      raw: true,
      where: { id: id_supplier, active: 1 },
      attributes: ['id', 'full_name', 'email'],
    });

    if (!user) {
      throw ApiError.badRequest('Usuário não encontrado');
    }

    const hasSupplierInProduct = await Suppliers_Product.findOne({
      raw: true,
      where: { id_product, id_user: id_supplier },
      attributes: ['id'],
    });

    if (hasSupplierInProduct) {
      throw ApiError.badRequest('Fornecedor já cadastrado no produto');
    }

    const hasACoproducer = await Coproductions.findOne({
      raw: true,
      attributes: ['id'],
      where: { id_product, id_user: user.id, status: [1, 2] },
    });

    if (hasACoproducer) {
      throw ApiError.badRequest('Coprodutor não pode ser fornecedor');
    }

    const hasAnAffiliate = await Affiliates.findOne({
      raw: true,
      attributes: ['id'],
      where: { id_user: user.id, id_product, status: [1, 2, 3] },
    });

    if (hasAnAffiliate) {
      throw ApiError.badRequest('Afiliado não pode ser fornecedor');
    }

    const isManager = await Managers.findOne({
      raw: true,
      attributes: ['id'],
      where: { id_user: user.id, id_product, id_status: [1, 2] },
    });

    if (isManager) {
      throw ApiError.badRequest('Gerente não pode ser fornecedor');
    }

    const supplier = await Suppliers_Product.create({
      id_user: user.id,
      id_status: 1,
      id_product,
      amount,
      receives_shipping_amount,
    });

    return res.status(200).send({
      id: supplier.id,
      amount,
      receives_shipping_amount,
      email: user.email,
      full_name: capitalizeName(user.full_name),
      status: findSupplierStatus(1),
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

module.exports.getSupplierProductDefault = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;

  try {
    const suppliers = await Suppliers_Product.findAll({
      where: { id_product },
      attributes: ['id', 'amount', 'receives_shipping_amount', 'id_status'],
      include: [
        {
          association: 'user',
          attributes: ['full_name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).send(
      suppliers.map((s) => ({
        id: s.id,
        amount: s.amount,
        email: s.user.email,
        receives_shipping_amount: s.receives_shipping_amount,
        full_name: capitalizeName(s.user.full_name),
        status: findSupplierStatus(s.id_status),
      })),
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

module.exports.updateSupplierProductDefault = async (req, res, next) => {
  const {
    product: { id: id_product },
    body: { amount, receives_shipping_amount },
    params: { id_supplier },
  } = req;

  try {
    const supplier = await Suppliers_Product.findOne({
      where: { id: id_supplier, id_product },
    });

    if (!supplier) {
      throw ApiError.badRequest('Fornecedor não encontrado');
    }

    const suppliersOffers = await Suppliers.findAll({
      raw: true,
      where: { id_user: supplier.id_user, id_product },
      attributes: ['id'],
    });

    if (suppliersOffers.length > 0) {
      suppliersOffers.forEach(async (offer) => {
        await Suppliers.update(
          { amount, receives_shipping_amount },
          { where: { id: offer.id } },
        );
      });
    }

    await Suppliers_Product.update(
      { amount, receives_shipping_amount },
      { where: { id: id_supplier } },
    );

    return res.status(200).send({
      id: supplier.id,
      amount,
      receives_shipping_amount,
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

module.exports.deleteSupplierProductDefault = async (req, res, next) => {
  const {
    product: { id: id_product },
    params: { id_supplier },
  } = req;

  try {
    const supplier = await Suppliers_Product.findOne({
      where: { id: id_supplier, id_product },
    });

    if (!supplier) {
      throw ApiError.badRequest('Fornecedor não encontrado');
    }

    const suppliersOffers = await Suppliers.findAll({
      raw: true,
      where: { id_user: supplier.id_user, id_product },
      attributes: ['id'],
    });

    if (suppliersOffers.length > 0) {
      suppliersOffers.forEach(async (offer) => {
        await Suppliers.destroy({ where: { id: offer.id } });
      });
    }

    await Suppliers_Product.destroy({ where: { id: id_supplier } });

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
