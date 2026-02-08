const { Sequelize } = require('sequelize');
const { format } = require('@fast-csv/format');
const Cart = require('../../database/models/Cart');
const SerializeCheckoutAbandoned = require('../../presentation/dashboard/checkout');
const SerializeCheckoutExportAbandoned = require('../../presentation/dashboard/checkoutExport');
const ApiError = require('../../error/ApiError');
const DateHelper = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');
const Cache = require('../../config/Cache');

const listCheckoutAbandonedController = async (req, res, next) => {
  try {
    const {
      user: { id: id_user },
      query: {
        startDate,
        endDate,
        product,
        input,
        offers,
        page,
        size,
        type_affiliate,
      },
    } = req;

    const offset = page * size;
    const limit = Number(size);

    let whereClause =
      'abandoned = 1 AND deleted_at IS NULL AND id_offer IS NOT NULL';
    const queryParams = [];

    if (startDate && endDate) {
      const startDateFormatted = DateHelper(startDate)
        .startOf('day')
        .add(3, 'hour')
        .format(DATABASE_DATE);
      const endDateFormatted = DateHelper(endDate)
        .endOf('day')
        .add(3, 'hour')
        .format(DATABASE_DATE);

      whereClause += ' AND created_at BETWEEN ? AND ?';
      queryParams.push(startDateFormatted, endDateFormatted);
    }

    if (input && input.includes('@')) {
      whereClause += ' AND email = ?';
      queryParams.push(input);
    } else if (input) {
      whereClause += ' AND full_name LIKE ?';
      queryParams.push(`%${input}%`);
    }

    if (product) {
      if (product.includes(',')) {
        const productIds = product.split(',').map((id) => parseInt(id, 10));
        whereClause += ' AND id_product IN (?)';
        queryParams.push(productIds);
      } else {
        whereClause += ' AND id_product = ?';
        queryParams.push(parseInt(product, 10));
      }
    }

    if (offers) {
      if (offers.includes(',')) {
        const offerIds = offers.split(',').map((id) => parseInt(id, 10));
        whereClause += ' AND id_offer IN (?)';
        queryParams.push(offerIds);
      } else {
        whereClause += ' AND id_offer = ?';
        queryParams.push(parseInt(offers, 10));
      }
    }

    if (type_affiliate === true) {
      whereClause += ' AND id_affiliate IS NOT NULL';
    } else if (type_affiliate === false) {
      whereClause += ' AND id_affiliate IS NULL';
    }

    const limitOffset =
      whereClause ===
      'abandoned = 1 AND deleted_at IS NULL AND id_offer IS NOT NULL AND created_at BETWEEN ? AND ?'
        ? 'LIMIT ? OFFSET ?'
        : 'LIMIT ? OFFSET ?';

    let accessCondition = '';
    const accessParams = [];
    if (type_affiliate !== true || type_affiliate !== false) {
      accessCondition += 'id_affiliate = (?)';
      accessParams.push(id_user);
    }

    accessCondition += `${
      accessCondition ? ' OR ' : ''
    }id_product IN (SELECT id FROM products WHERE id_user = ? AND deleted_at IS NULL)`;
    accessParams.push(id_user);

    const idsQuery = `
      SELECT id, updated_at
      FROM cart
      WHERE ${whereClause}
        AND (${accessCondition})
      ORDER BY updated_at DESC
      ${limitOffset}
    `;

    const idsParams = [...queryParams, ...accessParams, limit, offset];

    const idsResult = await Cart.sequelize.query(idsQuery, {
      replacements: idsParams,
      type: Sequelize.QueryTypes.SELECT,
    });

    if (idsResult.length === 0) {
      return res.status(200).send({
        rows: [],
        count: 0,
      });
    }

    const cartIds = idsResult.map((row) => row.id);

    const fullData = await Cart.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: cartIds,
        },
        id_offer: {
          [Sequelize.Op.ne]: null,
        },
      },
      include: [
        {
          association: 'offer',
          required: true,
          attributes: ['id', 'uuid', 'name', 'price'],
        },
        {
          association: 'product',
          attributes: ['id', 'name', 'cover'],
          required: false,
          include: [
            {
              association: 'affiliates',
              attributes: ['id', 'uuid'],
              required: false,
              where: { id_user },
            },
          ],
        },
        {
          association: 'sale_item',
          required: false,
          attributes: ['id', 'id_affiliate'],
        },
      ],
      order: [['updated_at', 'DESC']],
    });

    const countQuery = `
      SELECT COUNT(*) as total
      FROM cart
      WHERE ${whereClause}
        AND (${accessCondition})
    `;

    const countParams = [...queryParams, ...accessParams];

    const key = `abandoned_cart:${id_user}:${countParams}:${type_affiliate}`;
    let countResult = null;
    countResult = await Cache.get(key);
    if (countResult) {
      countResult = JSON.parse(countResult);
    } else {
      countResult = await Cart.sequelize.query(countQuery, {
        replacements: countParams,
        type: Sequelize.QueryTypes.SELECT,
      });

      await Cache.set(key, JSON.stringify(countResult));
    }

    return res.status(200).send({
      rows: new SerializeCheckoutAbandoned(fullData).adapt(id_user),
      count: countResult[0].total,
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
};

const getTotalOffersCheckoutAbandonedController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { startDate, endDate, product, input, offers, type_affiliate },
  } = req;

  try {
    let whereClause =
      'c.abandoned = 1 AND c.deleted_at IS NULL AND c.id_offer IS NOT NULL';
    const queryParams = [];

    if (startDate && endDate) {
      const startDateFormatted = DateHelper(startDate)
        .startOf('day')
        .add(3, 'hour')
        .format(DATABASE_DATE);
      const endDateFormatted = DateHelper(endDate)
        .endOf('day')
        .add(3, 'hour')
        .format(DATABASE_DATE);

      whereClause += ' AND c.created_at BETWEEN ? AND ?';
      queryParams.push(startDateFormatted, endDateFormatted);
    }

    if (type_affiliate === true) {
      whereClause += ' AND c.id_affiliate IS NOT NULL';
    } else if (type_affiliate === false) {
      whereClause += ' AND c.id_affiliate IS NULL';
    }

    if (input && input.includes('@')) {
      whereClause += ' AND c.email = ?';
      queryParams.push(input);
    } else if (input) {
      whereClause += ' AND c.full_name LIKE ?';
      queryParams.push(`%${input}%`);
    }

    if (product) {
      if (product.includes(',')) {
        const productIds = product.split(',').map((id) => parseInt(id, 10));
        whereClause += ' AND c.id_product IN (?)';
        queryParams.push(productIds);
      } else {
        whereClause += ' AND c.id_product = ?';
        queryParams.push(parseInt(product, 10));
      }
    }

    if (offers) {
      if (offers.includes(',')) {
        const offerIds = offers.split(',').map((id) => parseInt(id, 10));
        whereClause += ' AND c.id_offer IN (?)';
        queryParams.push(offerIds);
      } else {
        whereClause += ' AND c.id_offer = ?';
        queryParams.push(parseInt(offers, 10));
      }
    }

    let accessCondition = '';
    const accessParams = [];

    if (type_affiliate === undefined || type_affiliate === null) {
      accessCondition +=
        'c.id_affiliate IN (SELECT id FROM affiliates WHERE id_user = ? AND deleted_at IS NULL)';
      accessParams.push(id_user);
    }

    accessCondition += `${
      accessCondition ? ' OR ' : ''
    }c.id_product IN (SELECT id FROM products WHERE id_user = ? AND deleted_at IS NULL)`;
    accessParams.push(id_user);

    const totalOfferQuery = `
      SELECT COALESCE(SUM(po.price), 0) AS total_offer
      FROM cart c
      INNER JOIN product_offer po ON c.id_offer = po.id AND po.deleted_at IS NULL
      WHERE ${whereClause}
        AND (${accessCondition})
    `;

    const totalOfferParams = [...queryParams, ...accessParams];

    const totalOfferResult = await Cart.sequelize.query(totalOfferQuery, {
      replacements: totalOfferParams,
      type: Sequelize.QueryTypes.SELECT,
    });

    const total_offer =
      totalOfferResult && totalOfferResult[0] && totalOfferResult[0].total_offer
        ? parseFloat(totalOfferResult[0].total_offer)
        : 0;

    return res.status(200).send({
      total_offer,
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
};

const exportCheckoutAbondoned = async (req, res, next) => {
  try {
    const {
      user: { id: id_user },
      query: { startDate, endDate, type_affiliate: type_affiliateRaw },
    } = req;

    let type_affiliate;
    if (type_affiliateRaw === 'true' || type_affiliateRaw === true) {
      type_affiliate = true;
    } else if (type_affiliateRaw === 'false' || type_affiliateRaw === false) {
      type_affiliate = false;
    } else {
      type_affiliate = undefined;
    }

    let whereClause =
      'abandoned = 1 AND deleted_at IS NULL AND id_offer IS NOT NULL';
    const queryParams = [];

    if (startDate && endDate) {
      const startDateFormatted = DateHelper(startDate)
        .startOf('day')
        .add(3, 'hour')
        .format(DATABASE_DATE);
      const endDateFormatted = DateHelper(endDate)
        .endOf('day')
        .add(3, 'hour')
        .format(DATABASE_DATE);

      whereClause += ' AND created_at BETWEEN ? AND ?';
      queryParams.push(startDateFormatted, endDateFormatted);
    }

    if (type_affiliate === true) {
      whereClause += ' AND id_affiliate IS NOT NULL';
    } else if (type_affiliate === false) {
      whereClause += ' AND id_affiliate IS NULL';
    }

    let accessCondition = '';
    const accessParams = [];

    if (type_affiliate === true || type_affiliate === false) {
      accessCondition +=
        'id_product IN (SELECT id FROM products WHERE id_user = ? AND deleted_at IS NULL)';
      accessParams.push(id_user);
    } else {
      accessCondition +=
        'id_affiliate IN (SELECT id FROM affiliates WHERE id_user = ? AND deleted_at IS NULL)';
      accessParams.push(id_user);
      accessCondition +=
        ' OR id_product IN (SELECT id FROM products WHERE id_user = ? AND deleted_at IS NULL)';
      accessParams.push(id_user);
    }

    const idsQuery = `
      SELECT id
      FROM cart
      WHERE ${whereClause}
        AND (${accessCondition})
      ORDER BY updated_at DESC
    `;

    const idsParams = [...queryParams, ...accessParams];

    const idsResult = await Cart.sequelize.query(idsQuery, {
      replacements: idsParams,
      type: Sequelize.QueryTypes.SELECT,
    });

    if (idsResult.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="checkout-abandoned.csv"',
      );

      const csvStream = format({ headers: true });
      csvStream.pipe(res);
      csvStream.end();
      return;
    }

    const cartIds = idsResult.map((row) => row.id);

    const abandoned = await Cart.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: cartIds,
        },
        id_offer: {
          [Sequelize.Op.ne]: null,
        },
      },
      include: [
        {
          association: 'offer',
          required: true,
          attributes: ['id', 'uuid', 'name', 'price'],
        },
        {
          association: 'product',
          attributes: ['id', 'name', 'cover'],
          required: false,
          include: [
            {
              association: 'affiliates',
              attributes: ['id', 'uuid'],
              required: false,
              where: { id_user },
            },
          ],
        },
        {
          association: 'sale_item',
          required: false,
          attributes: ['id', 'id_affiliate'],
        },
        {
          association: 'affiliate',
          required: false,
          include: [
            {
              association: 'user',
              attributes: ['id', 'full_name'],
              required: false,
            },
          ],
        },
      ],
      order: [['updated_at', 'DESC']],
    });
    const serialize = new SerializeCheckoutExportAbandoned(abandoned).adapt();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="checkout-abandoned.csv"',
    );

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    serialize.forEach((item) => csvStream.write(item));
    csvStream.end();
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
};

module.exports = {
  listCheckoutAbandonedController,
  getTotalOffersCheckoutAbandonedController,
  exportCheckoutAbondoned,
};
