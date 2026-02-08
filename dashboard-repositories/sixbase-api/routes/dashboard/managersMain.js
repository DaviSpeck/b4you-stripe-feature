const router = require('express').Router();
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const Managers = require('../../database/models/Managers');
const Products = require('../../database/models/Products');
const Affiliates = require('../../database/models/Affiliates');
const ApiError = require('../../error/ApiError');
const { capitalizeName } = require('../../utils/formatters');
const { findManagerStatus } = require('../../status/managersStatus');
const { findAffiliateStatus } = require('../../status/affiliateStatus');
const db = require('../../database/models/index');

router.get('/', async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const managers = await Managers.findAll({
      nest: true,
      raw: true,
      where: { id_user },
      include: [
        {
          association: 'product',
          attributes: ['name'],
          required: true,
          include: [
            { association: 'producer', attributes: ['full_name', 'email'], required: true, },
          ],
        },
      ],
    });
    return res.status(200).send(
      managers.map(({ product, ...rest }) => ({
        ...rest,
        product_name: capitalizeName(product.name),
        producer_name: capitalizeName(product.producer.full_name),
        producer_email: product.producer.email,
        status: findManagerStatus(rest.id_status),
        link: rest.allow_share_link
          ? `https://api-b4${
              process.env.ENVIRONMENT !== 'PRODUCTION' ? '-sandbox' : ''
            }.b4you.com.br/api/manager/${rest.uuid}`
          : null,
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
});

router.put('/', async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { id, status },
  } = req;

  try {
    if (![2, 3].includes(status)) {
      throw ApiError.badRequest('Status inválido');
    }

    const manager = await Managers.findOne({
      raw: true,
      where: { id_user, id },
    });

    if (!manager) {
      throw ApiError.badRequest('Convite não encontrado');
    }

    await Managers.update({ id_status: status }, { where: { id } });
    return res.status(200).send({ status: findManagerStatus(status) });
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

router.get('/managements', async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const managers = await Managers.findAll({
      nest: true,
      raw: true,
      include: [
        {
          association: 'product',
          attributes: ['name', 'uuid'],
          where: { id_user },
        },
        {
          association: 'user',
          attributes: ['full_name', 'email'],
        },
      ],
    });
    return res.status(200).send(
      managers.map(({ product, user, ...rest }) => ({
        ...rest,
        allow_share_link: !!rest.allow_share_link,
        product_name: capitalizeName(product.name),
        product_uuid: product.uuid,
        status: findManagerStatus(rest.id_status),
        full_name: capitalizeName(user.full_name),
        email: user.email,
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
});

router.get('/affiliatesByManagerAndProduct', async (req, res, next) => {
  const { user } = req;
  const { manager, product, name, has_sales } = req.query;
  let { column, direction, page = 0, size = 10 } = req.query;
  try {
    const validColumns = [
      'full_name',
      'total_items_sold',
      'commission',
      'commission_amount',
      'created_at',
    ];

    const validDirections = ['ASC', 'DESC'];

    if (!validColumns.includes(column)) {
      column = 'full_name';
    }

    if (!validDirections.includes(direction)) {
      direction = 'ASC';
    }

    const offset = Number(page) * Number(size);
    const limit = Number(size);
    const salesOnly = has_sales === 'true';

    const baseQuery = `
     SELECT 
      u.id AS id_user,
      a.id AS id_affiliate,
      u.full_name, 
      u.email,
      a.commission, 
      a.status,
      a.created_at,
      COUNT(DISTINCT si.id) AS total_items_sold,
      SUM(DISTINCT COALESCE(c.amount, 0)) AS commission_amount
     FROM 
      affiliates a 
     INNER JOIN 
      users u ON a.id_user = u.id
     INNER JOIN
      products p ON a.id_product = p.id AND p.id = :id_product
     LEFT JOIN
      sales_items si ON 
       si.id_affiliate = a.id 
       AND si.id_product = p.id 
       AND si.id_status = 2
     LEFT JOIN 
      commissions c ON 
       c.id_sale_item = si.id 
       AND c.id_status IN (2, 3)
       AND c.id_user = :id_user
     WHERE 
      a.id_manager = :id_manager
      ${name ? 'AND u.full_name LIKE :name' : ''}
     GROUP BY 
      u.id, a.id, u.full_name, u.email, a.commission, a.status, a.created_at
    ${salesOnly ? 'HAVING COUNT(DISTINCT si.id) > 0' : ''}
  `;

  const countSql = `
    SELECT COUNT(*) AS total FROM (
      ${baseQuery}
    ) AS count_table
  `;

  const dataSql = `
    ${baseQuery}
    ORDER BY ${column} ${direction}
    LIMIT :limit OFFSET :offset
  `;

  const replacements = {
        id_user: user.id,
        id_product: parseInt(product, 10),
        id_manager: parseInt(manager, 10),
        column,
        direction,
        name: name && `%${name}%`,
        limit,
        offset};

  const [{ total }] = await db.sequelize.query(countSql, {
    replacements,
    type: Sequelize.QueryTypes.SELECT,
  });

  const results = await db.sequelize.query(dataSql, {
    replacements,
      type: Sequelize.QueryTypes.SELECT,
    });

    const resultsWithStatus = results.map((r) => ({
      ...r,
      status: findAffiliateStatus(r.status),
    }));

    return res.status(200).send({ rows: resultsWithStatus, count: Number(total) });
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
});

router.get('/affiliates/:product_uuid/:manager_id', async (req, res, next) => {
  const {
    params: { product_uuid, manager_id },
    query: { page = 0, size = 10, email, filter },
    user: { id: id_user },
  } = req;

  const limit = Number(size);
  const offset = Number(page) * limit;
  try {
    const product = await Products.findOne({
      raw: true,
      where: { uuid: product_uuid, id_user },
      attributes: ['id'],
    });
    if (!product) {
      throw ApiError.badRequest('produto não encontrado');
    }
    const manager = await Managers.findOne({
      raw: true,
      where: { id: manager_id, id_product: product.id },
    });

    if (!manager) {
      throw ApiError.badRequest('Gerente não encontrado');
    }

    const where = {
      status: [1, 2],
      id_product: product.id,
      id_user: {
        [Op.ne]: manager.id_user,
      },
    };

    if (email) {
      where['$user.email$'] = { [Op.like]: `%${email}%` };
    }

    if (filter) {
      if (filter === 'selected') {
        where.id_manager = manager.id;
      }

      if (filter === 'not-selected') {
        where.id_manager = null;
      }
    }

    const affiliates = await Affiliates.findAndCountAll({
      offset,
      limit,
      attributes: ['id', 'status', 'id_user', 'commission', 'id_manager'],
      nest: true,
      where,
      include: [
        { association: 'user', attributes: ['full_name', 'email'] },
        {
          association: 'manager',
          attributes: ['id', 'id_user'],
          include: [
            { association: 'user', attributes: ['full_name', 'email'] },
          ],
        },
      ],
    });
    return res.status(200).send({
      count: affiliates.count,
      rows: affiliates.rows.map((a) => {
        const { user, id_user: i, ...rest } = a.toJSON();
        return {
          ...rest,
          full_name: capitalizeName(user.full_name),
          email: user.email,
          status: findAffiliateStatus(rest.status),
          manager: rest.manager
            ? {
                full_name: capitalizeName(rest.manager.user.full_name),
                email: rest.manager.user.email,
              }
            : null,
        };
      }),
    });
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

router.post('/manage', async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { type, affiliates, all_affiliates = false, manager_id, del },
  } = req;
  try {
    const manager = await Managers.findOne({
      raw: true,
      where: { id: manager_id },
      include: [
        { association: 'product', where: { id_user }, attributes: ['id'] },
      ],
    });
    if (!manager) {
      throw ApiError.badRequest('Gerente não encontrado ');
    }

    if (type === 'all') {
      await Managers.update(
        { type: 'not-all' },
        { where: { id_product: manager.id_product, type: 'all' } },
      );
    }

    await Managers.update({ type }, { where: { id: manager.id } });
    if (all_affiliates) {
      await Affiliates.update(
        { id_manager: manager.id },
        {
          where: {
            id_product: manager.id_product,
            id_user: {
              [Op.ne]: manager.id_user,
            },
          },
        },
      );
    } else {
      await Affiliates.update(
        { id_manager: manager.id },
        {
          where: {
            id_product: manager.id_product,
            id: affiliates,
            id_user: {
              [Op.ne]: manager.id_user,
            },
          },
        },
      );
    }

    if (Array.isArray(del) && del.length > 0) {
      await Affiliates.update(
        { id_manager: null },
        {
          where: {
            id_product: manager.id_product,
            id: del,
            id_manager: manager.id,
          },
        },
      );
    }

    return res.sendStatus(200);
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

module.exports = router;
