const router = require('express').Router();
const { Sequelize } = require('sequelize');
const Suppliers = require('../../database/models/Suppliers');
const ApiError = require('../../error/ApiError');
const { findSupplierStatus } = require('../../status/suppliersStatus');
const { capitalizeName } = require('../../utils/formatters');
const db = require('../../database/models/index');
const Suppliers_Product = require('../../database/models/Suppliers_Product');
const Product_offer = require('../../database/models/Product_offer');

router.get('/', async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;

  try {
    const suppliers = await Suppliers.findAll({
      raw: true,
      where: { id_user },
      nest: true,
      include: [
        {
          association: 'product',
          attributes: ['name'],
        },
      ],
    });

    return res.status(200).send(
      suppliers.map((s) => ({
        product_name: capitalizeName(s.product.name),
        status: findSupplierStatus(s.id_status),
        amount: s.amount,
        id: s.id,
      })),
    );
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

router.get('/group', async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;

  try {
    const suppliers = await Suppliers.findAll({
      raw: true,
      where: { id_user },
      nest: true,
      group: ['product.uuid', 'id_status'],
      include: [
        {
          association: 'product',
          attributes: ['name', 'uuid', 'id'],
        },
      ],
    });

    const suppliersDefault = await Suppliers_Product.findAll({
      raw: true,
      where: { id_user },
      nest: true,
      group: ['product.uuid', 'id_status'],
      include: [
        {
          association: 'product',
          attributes: ['name', 'uuid', 'id'],
        },
      ],
    });

    const suppliersConcat = suppliers.concat(suppliersDefault);

    const uniqueByProductId = new Map();

    suppliersConcat.forEach((item) => {
      const productId = item.product.id;
      if (!uniqueByProductId.has(productId)) {
        uniqueByProductId.set(productId, item);
      }
    });

    const uniqueSuppliers = Array.from(uniqueByProductId.values());

    return res.status(200).send(
      uniqueSuppliers.map((s) => ({
        uuiid_product: s.product.uuid,
        id_product: s.product.id,
        product_name: capitalizeName(s.product.name),
      })),
    );
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

router.get('/verifyProductDefault/:idProduct', async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { idProduct },
  } = req;

  try {
    const suppliers = await Suppliers_Product.findAll({
      raw: true,
      where: { id_user, id_product: idProduct },
      nest: true,
    });

    return res.status(200).send(
      suppliers.map((s) => ({
        id: s.id,
        id_user: s.id_user,
        id_product: s.id_product,
        status: findSupplierStatus(s.id_status),
        amount: s.amount,
        receives_shipping_amount: s.receives_shipping_amount,
      })),
    );
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

router.get('/products/:idProduct', async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { idProduct },
  } = req;

  try {
    const query = `
      SELECT po.name AS offer_name, s.id, s.amount, s.id_status
      FROM suppliers s 
      INNER JOIN users u ON u.id = s.id_user
      INNER JOIN product_offer po ON po.id = s.id_offer 
      WHERE s.id_product = :id_product and s.id_user = :id_user and s.deleted_at is null and po.deleted_at is null;`;

    const results = await db.sequelize.query(query, {
      replacements: { id_user, id_product: idProduct },
      type: Sequelize.QueryTypes.SELECT,
    });

    return res.status(200).send(
      results.map((s) => ({
        offer_name: capitalizeName(s.offer_name),
        status: findSupplierStatus(s.id_status),
        amount: s.amount,
        id: s.id,
      })),
    );
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

router.get('/mySuppliers', async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;

  try {
    const query = `
      SELECT DISTINCT u.id, u.full_name, u.email
      FROM suppliers s
      JOIN products p ON s.id_product = p.id
      JOIN users u ON u.id = s.id_user 
      WHERE p.id_user = ${id_user} AND s.deleted_at IS NULL;`;

    const results = await db.sequelize.query(query, {
      replacements: { id_user },
      type: Sequelize.QueryTypes.SELECT,
    });

    return res.status(200).send(results);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

router.get('/mySuppliers/products/:idUser', async (req, res, next) => {
  const {
    params: { idUser },
    user: { id: id_user },
  } = req;

  try {
    const query = `
      SELECT DISTINCT 
      p.name AS product_name, 
      p.uuid AS product_uuid, 
      u.id AS user_id
      FROM suppliers s
      JOIN products p ON s.id_product = p.id
      JOIN product_offer po ON po.id = s.id_offer 
      JOIN users u ON u.id = s.id_user 
      WHERE s.id_user = :idUser AND s.deleted_at IS NULL AND p.id_user = :id_user
    `;

    const results = await db.sequelize.query(query, {
      replacements: { idUser, id_user },
      type: Sequelize.QueryTypes.SELECT,
    });

    return res.status(200).send(results);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

router.get(
  '/mySuppliers/offers/:idUser/:productUUID',
  async (req, res, next) => {
    const {
      params: { idUser, productUUID },
      user: { id: id_user },
    } = req;

    try {
      const query = `
        SELECT s.id, s.id_status, s.id_product, s.id_offer, po.name AS offer_name, po.uuid AS offer_uuid, s.amount, s.receives_shipping_amount, u.id AS user_id
        FROM suppliers s
        JOIN products p ON s.id_product = p.id
        JOIN product_offer po ON po.id = s.id_offer 
        JOIN users u ON u.id = s.id_user 
        WHERE s.id_user = :idUser AND s.deleted_at IS NULL AND p.id_user = :id_user AND p.uuid = :productUUID
    `;

      const results = await db.sequelize.query(query, {
        replacements: { idUser, id_user, productUUID },
        type: Sequelize.QueryTypes.SELECT,
      });

      return res.status(200).send(
        results.map((elem) => ({
          ...elem,
          status: findSupplierStatus(elem.id_status),
        })),
      );
    } catch (error) {
      if (error instanceof ApiError) return res.status(error.code).send(error);
      return next(
        ApiError.internalServerError(
          `Internal Server Error, ${Object.keys(
            req.route.methods,
          )[0].toUpperCase()}: ${req.originalUrl}`,
        ),
      );
    }
  },
);

router.put('/', async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { id, status },
  } = req;
  try {
    if (![2, 3].includes(status)) {
      throw ApiError.badRequest('Status inválido');
    }
    const supplier = await Suppliers.findOne({
      raw: true,
      where: { id_user, id },
    });
    if (!supplier) {
      throw ApiError.badRequest('Convite não encontrado');
    }
    await Suppliers.update({ id_status: status }, { where: { id } });
    return res.status(200).send({ status: findSupplierStatus(status) });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

router.put(
  '/default/:id_supplier/:id_product/accept',
  async (req, res, next) => {
    const {
      params: { id_supplier, id_product },
    } = req;

    try {
      const supplier = await Suppliers_Product.findOne({
        where: { id: id_supplier, id_product },
      });

      if (!supplier) {
        throw ApiError.badRequest('Fornecedor não encontrado');
      }

      await Suppliers_Product.update(
        { id_status: 2 },
        { where: { id: id_supplier } },
      );

      const offers = await Product_offer.findAll({
        raw: true,
        where: { id_product },
        attributes: ['id'],
      });

      await Promise.all(
        offers.map(async (offer) => {
          const supplierOffer = await Suppliers.findOne({
            raw: true,
            where: { id_user: supplier.id_user, id_offer: offer.id },
          });

          if (!supplierOffer) {
            await Suppliers.create({
              id_user: supplier.id_user,
              id_status: 2,
              id_product,
              id_offer: offer.id,
              amount: supplier.amount,
              receives_shipping_amount: supplier.receives_shipping_amount,
            });
          }
        }),
      );

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
  },
);

router.put(
  '/default/:id_supplier/:id_product/reject',
  async (req, res, next) => {
    const {
      params: { id_supplier },
    } = req;

    try {
      const supplier = await Suppliers_Product.findOne({
        where: { id: id_supplier },
      });

      if (!supplier) {
        throw ApiError.badRequest('Fornecedor não encontrado');
      }

      await Suppliers_Product.update(
        { id_status: 3 },
        { where: { id: id_supplier } },
      );

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
  },
);

module.exports = router;
