const Sequelize = require('sequelize');
const { OP } = require('./Sequelize');
const { QueryTypes } = require('sequelize');
const SalesItems = require('../../database/models/Sales_items');
const {
  findCoproductionStatusByKey,
} = require('../../status/coproductionsStatus');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const { DATABASE_DATE } = require('../../types/dateTypes');
const date = require('../../utils/helpers/date');
const dateHelper = require('../../utils/helpers/date');
const { DOCUMENT, ONLY_DIGITS } = require('../../utils/regex');
const { findRoleTypeByKey, rolesTypes } = require('../../types/roles');
const { regionToStates } = require('../../mocks/region.mock');
const SalesFilters = require('../../utils/salesFilters');
const {
  processStateAndRegionFromAgg,
} = require('../../utils/checkoutAggregations');
const CheckoutFilters = require('../../utils/checkoutFilters');

const formatWhere = ({
  endDate,
  id_status,
  input,
  paymentMethod,
  productUUID,
  startDate,
  trackingParameters,
}) => {
  let where = {};
  if (id_status) where.id_status = id_status;
  if (paymentMethod) where.payment_method = paymentMethod;
  if (productUUID) where = { ...where, '$product.uuid$': productUUID };
  if (startDate && endDate) {
    where.created_at = {
      [OP.between]: [
        date(startDate)
          .utcOffset(-3, true)
          .startOf('day')
          .utc()
          .format(DATABASE_DATE),
        date(endDate)
          .utcOffset(-3, true)
          .endOf('day')
          .utc()
          .format(DATABASE_DATE),
      ],
    };
  }
  if (input) {
    let orObject = {
      '$student.full_name$': { [OP.like]: `%${input}%` },
      '$student.email$': { [OP.like]: `%${input}%` },
      '$product.name$': { [OP.like]: `%${input}%` },
      uuid: { [OP.like]: `%${input}%` },
    };
    if (DOCUMENT.test(input)) {
      const sanitizedInput = input.replace(ONLY_DIGITS, '');
      if (sanitizedInput.length > 0) {
        orObject = {
          ...orObject,
          '$student.document_number$': { [OP.like]: `%${sanitizedInput}%` },
        };
      }
    }

    where = {
      ...where,
      [OP.or]: orObject,
    };
  }

  if (trackingParameters.src) where.src = trackingParameters.src;
  if (trackingParameters.sck) where.sck = trackingParameters.sck;
  if (trackingParameters.utm_source)
    where.utm_source = trackingParameters.utm_source;
  if (trackingParameters.utm_medium)
    where.utm_medium = trackingParameters.utm_medium;
  if (trackingParameters.utm_campaign)
    where.utm_campaign = trackingParameters.utm_campaign;
  if (trackingParameters.utm_content)
    where.utm_content = trackingParameters.utm_content;
  if (trackingParameters.utm_term) where.utm_term = trackingParameters.utm_term;
  return where;
};

const queryRole = (role) => {
  let roles = rolesTypes.map((r) => r.id);
  if (!role.producer) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('producer').id);
  }

  if (!role.coproducer) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('coproducer').id);
  }

  if (!role.affiliate) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('affiliate').id);
  }

  if (!role.supplier) {
    roles = roles.filter((r) => r !== findRoleTypeByKey('supplier').id);
  }
  return roles;
};

module.exports = class SalesItemsRepository {
  static async find(where) {
    const saleItem = await SalesItems.findOne({
      nest: true,
      where,
      include: [
        {
          association: 'transactions',
          include: [
            {
              association: 'user',
            },
          ],
        },
        {
          association: 'product',
          paranoid: false,
          include: [
            {
              association: 'producer',
              include: [
                {
                  association: 'user_sale_settings',
                },
              ],
            },
            {
              association: 'coproductions',
              where: {
                status: findCoproductionStatusByKey('active').id,
              },
              required: false,
              include: [
                {
                  association: 'user',
                  include: [
                    {
                      association: 'user_sale_settings',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (saleItem) return saleItem.toJSON();
    return saleItem;
  }

  static async findToSplit(where) {
    const saleItem = await SalesItems.findOne({
      where,
      nest: true,
      include: [
        {
          association: 'product',
          include: [
            {
              association: 'producer',
              include: [
                {
                  association: 'user_sale_settings',
                },
              ],
            },
            {
              association: 'coproductions',
              required: false,
              where: {
                status: findCoproductionStatusByKey('active').id,
              },
              include: [
                {
                  association: 'user',
                  include: [
                    {
                      association: 'user_sale_settings',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          association: 'affiliate',
          include: [
            {
              association: 'user',
              include: [
                {
                  association: 'user_sale_settings',
                },
              ],
            },
          ],
        },
      ],
    });

    if (saleItem) return saleItem.toJSON();
    return saleItem;
  }

  static async update(where, data) {
    await SalesItems.update(data, {
      where,
    });
  }

  static async findSalesPaginated({ page, size, userUuid, role, ...query }) {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    const where = formatWhere(query);
    const sales_items = await SalesItems.findAndCountAll({
      offset,
      limit,
      subQuery: false,
      where,
      attributes: ['created_at', 'id', 'uuid', 'id_status', 'payment_method'],
      order: [['id', 'DESC']],
      include: [
        { association: 'product', attributes: ['name'], paranoid: false },
        {
          association: 'student',
          attributes: ['full_name', 'email'],
        },
        {
          association: 'commissions',
          include: [
            {
              association: 'user',
              attributes: [],
              where: {
                uuid: userUuid,
              },
            },
          ],
          where: {
            id_role: queryRole(role),
          },
          attributes: ['amount', 'id_status', 'id_role', 'id_user'],
        },
      ],
    });

    return sales_items;
  }

  static async findSaleTransactions(uuid_sale_item) {
    const sales_items = await SalesItems.findOne({
      where: {
        uuid: uuid_sale_item,
      },
      attributes: [
        'price_product',
        'valid_refund_until',
        'payment_method',
        'uuid',
      ],
      include: [
        {
          association: 'coupon_sale',
          include: [
            {
              association: 'coupon',
            },
          ],
        },
        {
          association: 'commissions',
          attributes: ['id_status', 'release_date', 'id_role', 'amount'],
          include: [
            {
              association: 'user',
              attributes: ['uuid', 'full_name', 'email'],
            },
          ],
        },
        {
          association: 'student',
          attributes: ['full_name', 'email', 'uuid', 'document_number'],
        },
        {
          association: 'charges',
          attributes: ['price', 'installments'],
        },
      ],
    });

    if (!sales_items) return null;
    return sales_items.toJSON();
  }

  static async findStudentSales(id_student) {
    const sales_items = await SalesItems.findAndCountAll({
      subQuery: false,
      distinct: true,
      attributes: [
        'created_at',
        'id',
        'price',
        'id_status',
        'uuid',
        'payment_method',
        'paid_at',
        'valid_refund_until',
        'type',
        'id_affiliate',
        'tracking_code',
        'tracking_url',
        'tracking_company',
        'credit_card',
        'price_total',
        'price_product',
        'id_sale',
      ],
      order: [['id', 'DESC']],
      where: { id_student },
      include: [
        {
          association: 'product',
          attributes: [
            'name',
            'uuid',
            'support_email',
            'support_whatsapp',
            'id_type',
            'payment_type',
          ],
          paranoid: false,
          include: [
            {
              association: 'producer',
              attributes: ['full_name', 'email', 'uuid'],
            },
          ],
        },
        {
          association: 'affiliate',
          attributes: ['id'],
          include: [
            {
              association: 'user',
              attributes: ['first_name', 'last_name', 'uuid'],
            },
          ],
        },
        {
          association: 'refund',
          attributes: ['created_at', 'id_status', 'updated_at', 'reason'],
        },
        {
          association: 'charges',
          attributes: [
            'installments',
            'price',
            'psp_id',
            'provider',
            'provider_id',
            'billet_url',
            'uuid',
            'provider_response_details',
          ],
        },

        {
          association: 'referral_commission',
          required: false,
          attributes: ['id', 'amount', 'id_status', 'release_date'],
          include: [
            {
              association: 'user',
              attributes: ['full_name', 'uuid'],
            },
          ],
        },
        { association: 'sale', attributes: ['params'] },
      ],
    });

    return sales_items;
  }

  static async findOverallSales({
    end_date,
    id_status,
    page,
    size,
    start_date,
    payment_method,
    input,
  }) {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    if (!start_date || !end_date) {
      start_date = dateHelper().startOfMonth();
      end_date = dateHelper().now();
    }
    start_date = dateHelper(start_date).startOf('day').utc();
    end_date = dateHelper(end_date).endOf('day').utc();

    let where = {
      created_at: {
        [OP.between]: [start_date, end_date],
      },
    };
    if (id_status !== 'all') where.id_status = id_status;
    if (payment_method !== 'all') where.payment_method = payment_method;
    if (input) {
      const orObject = {
        [Sequelize.Op.or]: {
          uuid: {
            [Sequelize.Op.like]: `%${input}%`,
          },
          '$product.name$': {
            [Sequelize.Op.like]: `%${input}%`,
          },
          '$product.uuid$': {
            [Sequelize.Op.like]: `%${input}%`,
          },
          '$student.full_name$': {
            [Sequelize.Op.like]: `%${input}%`,
          },
          '$student.email$': {
            [Sequelize.Op.like]: `%${input}%`,
          },
          '$student.uuid$': {
            [Sequelize.Op.like]: `%${input}%`,
          },
          '$student.document_number$': {
            [Sequelize.Op.like]: `%${input}%`,
          },
          '$affiliate.user.full_name$': {
            [Sequelize.Op.like]: `%${input}%`,
          },
        },
      };
      where = {
        ...where,
        ...orObject,
      };
    }

    const include = [
      {
        association: 'product',
        attributes: ['name', 'uuid'],
        paranoid: false,
        include: [{ association: 'producer', attributes: ['uuid'] }],
      },
      {
        association: 'student',
        attributes: ['document_number', 'full_name', 'email', 'uuid'],
      },
      {
        association: 'affiliate',
        attributes: ['id'],
        include: [
          {
            association: 'user',
            attributes: ['full_name', 'uuid'],
          },
        ],
      },
    ];

    const sales_items = await SalesItems.findAndCountAll({
      offset,
      limit,
      logging: false,
      subQuery: false,
      where,
      attributes: [
        'created_at',
        'id',
        'uuid',
        'id_status',
        'price_total',
        'payment_method',
        'paid_at',
      ],
      order: [['id', 'DESC']],
      include,
    });
    const sales_total = await SalesItems.findAll({
      where,
      raw: true,
      attributes: [
        'id_status',
        'price',
        [Sequelize.fn('SUM', Sequelize.col('price_total')), 'total'],
      ],
      include,
    });
    return {
      rows: sales_items.rows,
      count: sales_items.count,
      total: sales_total[0].total ? sales_total[0].total : 0,
    };
  }

  static async countSales(id_product) {
    const start_date = dateHelper().subtract(30, 'days');
    const end_date = dateHelper();
    const sales = await SalesItems.findAll({
      attributes: ['id', 'id_status', 'created_at'],
      where: {
        id_product,
        id_status: {
          [OP.or]: [
            findSalesStatusByKey('paid').id,
            findSalesStatusByKey('request-refund').id,
            findSalesStatusByKey('refunded').id,
          ],
        },
        created_at: {
          [OP.between]: [start_date, end_date],
        },
      },
    });
    return sales.map((r) => r.toJSON());
  }

  static async averageSales(start_date, end_date, page, size) {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    if (!start_date || !end_date) {
      start_date = dateHelper().startOfMonth();
      end_date = dateHelper().now();
    }
    start_date = dateHelper(start_date).startOf('day').utc();
    end_date = dateHelper(end_date).endOf('day').utc();

    const count = await SalesItems.findAll({
      group: 'id_product',
      where: {
        id_status: findSalesStatusByKey('paid').id,
        created_at: {
          [OP.between]: [start_date, end_date],
        },
      },
    });
    const sales = await SalesItems.findAndCountAll({
      offset,
      limit,
      attributes: [
        'id_product',
        [
          Sequelize.fn('SUM', Sequelize.col('sales_items.price_product')),
          'total',
        ],
        [Sequelize.fn('COUNT', Sequelize.col('sales_items.id')), 'count'],
      ],
      group: 'id_product',
      order: [['total', 'DESC']],
      where: {
        id_status: findSalesStatusByKey('paid').id,
        created_at: {
          [OP.between]: [start_date, end_date],
        },
      },
      include: [
        {
          association: 'product',
          attributes: ['name', 'uuid', 'cover'],
          paranoid: false,
          include: [
            {
              association: 'producer',
              attributes: ['uuid'],
            },
          ],
        },
      ],
    });
    return {
      rows: sales.rows.map((r) => r.toJSON()),
      count: count.length,
    };
  }

  static async averageProducerSales(start_date, end_date, page, size) {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    if (!start_date || !end_date) {
      start_date = dateHelper().startOfMonth();
      end_date = dateHelper().now();
    }
    start_date = dateHelper(start_date)
      .startOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss');
    end_date = dateHelper(end_date)
      .endOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss');

    const count = await SalesItems.findAll({
      group: ['product.producer.id'],
      where: {
        id_status: findSalesStatusByKey('paid').id,
        created_at: {
          [OP.between]: [start_date, end_date],
        },
      },
      include: [
        {
          association: 'product',
          attributes: ['name'],
          paranoid: false,
          include: [
            {
              association: 'producer',
              attributes: ['full_name', 'id', 'uuid', 'profile_picture'],
            },
          ],
        },
      ],
    });

    const sales = await SalesItems.findAndCountAll({
      offset,
      limit,
      attributes: [
        'id_product',
        'price',
        [Sequelize.fn('SUM', Sequelize.col('sales_items.price')), 'total'],
      ],
      where: {
        id_status: findSalesStatusByKey('paid').id,
        created_at: {
          [OP.between]: [start_date, end_date],
        },
      },
      order: [['total', 'DESC']],
      group: ['product.producer.id'],
      include: [
        {
          association: 'product',
          attributes: ['name'],
          paranoid: false,
          include: [
            {
              association: 'producer',
              attributes: ['full_name', 'id', 'uuid', 'profile_picture'],
            },
          ],
        },
      ],
    });
    return {
      rows: sales.rows.map((r) => r.toJSON()),
      count: count.map((r) => r.toJSON()).length,
    };
  }

  static async averageAmount(start_date, end_date) {
    if (!start_date || !end_date) {
      start_date = dateHelper().startOfMonth();
      end_date = dateHelper().now();
    }
    start_date = dateHelper(start_date).startOf('day').utc();
    end_date = dateHelper(end_date).endOf('day').utc();
    const sales = await SalesItems.findAll({
      attributes: [
        'id_product',
        [
          Sequelize.fn('SUM', Sequelize.col('sales_items.price_total')),
          'total',
        ],
      ],
      group: 'id_product',
      order: [['total', 'DESC']],
      where: {
        id_status: findSalesStatusByKey('paid').id,
        created_at: {
          [OP.between]: [start_date, end_date],
        },
      },
      include: [
        { association: 'product', paranoid: false, attributes: ['name'] },
      ],
    });
    return sales.map((r) => r.toJSON());
  }

  static async averageAmountRangeByDay(start_date, end_date) {
    if (!start_date || !end_date) {
      start_date = dateHelper().startOfMonth();
      end_date = dateHelper().now();
    }

    const start = dateHelper(start_date).startOf('day').utc();
    const end = dateHelper(end_date).endOf('day').utc();

    const results = await SalesItems.findAll({
      attributes: [
        [
          Sequelize.fn(
            'DATE',
            Sequelize.fn(
              'DATE_SUB',
              Sequelize.col('sales_items.created_at'),
              Sequelize.literal('INTERVAL 3 HOUR'),
            ),
          ),
          'date',
        ],
        [Sequelize.fn('SUM', Sequelize.col('sales_items.price_total')), 'total'],
      ],
      where: {
        id_status: findSalesStatusByKey('paid').id,
        created_at: {
          [OP.between]: [start, end],
        },
      },
      group: [
        Sequelize.fn(
          'DATE',
          Sequelize.fn(
            'DATE_SUB',
            Sequelize.col('sales_items.created_at'),
            Sequelize.literal('INTERVAL 3 HOUR'),
          ),
        ),
      ],
      order: [[Sequelize.literal('date'), 'ASC']],
      raw: true,
    });

    return results.map(r => ({
      date: dateHelper(r.date).format('YYYY-MM-DD'),
      total: Number(r.total) || 0,
    }));
  }

  static async findToExport({
    id_status,
    start_date,
    end_date,
    offset,
    payment_method,
  }) {
    const dates = [
      date(start_date).utc().startOf('day').format(DATABASE_DATE),
      date(end_date).utc().endOf('day').format(DATABASE_DATE),
    ];

    if (date().diff(end_date, 'd') === 0) {
      dates[1] = date().format(DATABASE_DATE);
    }

    const where = {
      [Sequelize.Op.or]: {
        paid_at: {
          [Sequelize.Op.between]: dates,
        },
        [Sequelize.Op.and]: {
          created_at: {
            [Sequelize.Op.between]: dates,
          },
          paid_at: null,
        },
      },
    };

    if (id_status !== 'all') {
      where.id_status = id_status;
    }

    if (payment_method !== 'all') {
      where.payment_method = payment_method;
    }

    const salesItems = await SalesItems.findAll({
      nest: true,
      where,
      offset,
      limit: 200,
      order: [['id', 'desc']],
      attributes: [
        'created_at',
        'paid_at',
        'updated_at',
        'id_status',
        'payment_method',
        'id',
        'company_gross_profit_amount',
        'company_net_profit_amount',
        'fee_fixed',
        'fee_total',
        'fee_variable_amount',
        'tax_total',
        'interest_installment_amount',
        'price_product',
        'price_total',
        'type',
      ],
      include: [
        { association: 'sale', attributes: ['address'] },
        {
          association: 'student',
          attributes: ['document_number'],
        },
        {
          association: 'affiliate',
          attributes: ['id'],
          required: false,
          include: [{ association: 'user', attributes: ['full_name'] }],
        },
        {
          association: 'product',
          attributes: ['name', 'id_type'],
          paranoid: false,
          include: [
            {
              association: 'producer',
              attributes: ['full_name'],
            },
          ],
        },
        {
          association: 'commissions',
        },
        {
          association: 'offer',
          required: false,
          attributes: ['name'],
        },
        {
          association: 'charges',
          attributes: [
            'installments',
            'psp_cost_total',
            'psp_id',
            'provider',
            'provider_id',
          ],
        },
      ],
    });

    return salesItems.map((s) => s.toJSON());
  }

  static async countSalesExport({ id_status, start_date, end_date }) {
    const dates = [
      date(start_date).startOf('day').format(DATABASE_DATE),
      date(end_date).endOf('day').format(DATABASE_DATE),
    ];

    if (date().diff(end_date, 'd') === 0) {
      dates[1] = date().format(DATABASE_DATE);
    }

    const where = {
      created_at: {
        [Sequelize.OP.between]: dates,
      },
    };

    if (id_status !== 'all') {
      where.id_status = id_status;
    }

    const count = await SalesItems.count({ where });
    return count;
  }

  static async findAllSalesItemsForStats({
    start_date,
    end_date,
    id_status,
    region,
    state,
    id_product,
    id_user,
    payment_method,
  }) {
    const normState = state ? String(state).trim().toUpperCase() : undefined;
    if (region && regionToStates[region]) {
      const set = new Set(
        regionToStates[region].map((s) => String(s).toUpperCase()),
      );
      if (normState && !set.has(normState)) {
        return {
          rows: [],
          totalSalesPrice: 0,
          stateCounts: {},
          regionCounts: {},
        };
      }
    }

    const { filters, replacements } = CheckoutFilters.createAllFiltersSQL(
      { start_date, end_date, id_status, id_product, payment_method },
      { id_user, state: normState, region },
    );

    const totalsSql = `
      SELECT 
        COUNT(DISTINCT si.id) AS total_items,
        COALESCE(SUM(si.price_total), 0) AS total_sales_price
      FROM sales_items si
      INNER JOIN sales s ON si.id_sale = s.id
      WHERE 1=1
      ${filters}
    `;

    const [{ total_items, total_sales_price }] =
      await SalesItems.sequelize.query(totalsSql, {
        type: Sequelize.QueryTypes.SELECT,
        raw: true,
        replacements,
      });

    const hasGeoFilter = Boolean(region || normState);
    const stateAggSql = `
      SELECT 
        ${
          hasGeoFilter
            ? "COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.address, '$.state')), 'Indefinido')"
            : "COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.address, '$.state')), 'Indefinido')"
        } AS state,
        COUNT(DISTINCT si.id) AS count
      FROM sales_items si
      INNER JOIN sales s ON si.id_sale = s.id
      WHERE 1=1
      ${filters}
      GROUP BY ${
        hasGeoFilter
          ? "COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.address, '$.state')), 'Indefinido')"
          : "COALESCE(JSON_UNQUOTE(JSON_EXTRACT(s.address, '$.state')), 'Indefinido')"
      }
    `;

    const stateAgg = await SalesItems.sequelize.query(stateAggSql, {
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
      replacements,
    });

    const { stateCounts, regionCounts } =
      processStateAndRegionFromAgg(stateAgg);

    return {
      totalItems: Number(total_items || 0),
      totalSalesPrice: Number(Number(total_sales_price || 0).toFixed(2)),
      stateCounts,
      regionCounts,
    };
  }

  static async findOverallSalesWithSQL({
    end_date,
    id_status,
    page,
    size,
    start_date,
    payment_method,
    input,
  }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = {
        start_date,
        end_date,
        id_status,
        payment_method,
        input,
      };

      const { baseFilters, baseReplacements } =
        SalesFilters.createBaseFiltersSQL(where);

      const results = await SalesItems.sequelize.query(
        `
        SELECT 
          si.id,
          si.uuid,
          si.created_at,
          si.price,
          si.id_status,
          si.payment_method,
          si.paid_at,
          si.price_total,
          si.price_product,
          si.type,
          si.id_affiliate,
          si.tracking_code,
          si.tracking_url,
          si.tracking_company,
          si.credit_card,
          si.valid_refund_until,
          si.id_sale,
          p.name as product_name,
          p.uuid as product_uuid,
          p.support_email,
          p.support_whatsapp,
          p.id_type,
          p.payment_type,
          prod.full_name as producer_name,
          prod.email as producer_email,
          prod.uuid as producer_uuid,
          s.full_name as student_name,
          s.email as student_email,
          s.uuid as student_uuid,
          s.document_number as student_document,
          aff_user.first_name as affiliate_first_name,
          aff_user.last_name as affiliate_last_name,
          aff_user.uuid as affiliate_uuid,
          sale.params as sale_params,
          sale.id_user as sale_user_id,
          sale.state_generated as sale_state
        FROM sales_items si
        LEFT JOIN products p ON si.id_product = p.id
        LEFT JOIN users prod ON p.id_user = prod.id
        LEFT JOIN students s ON si.id_student = s.id
        LEFT JOIN sales sale ON si.id_sale = sale.id
        LEFT JOIN affiliates aff ON si.id_affiliate = aff.id
        LEFT JOIN users aff_user ON aff.id_user = aff_user.id
        WHERE 1=1
        ${baseFilters}
        ORDER BY si.id DESC
        LIMIT :limit OFFSET :offset
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            limit,
            offset,
            ...baseReplacements,
          },
        },
      );

      const countResult = await SalesItems.sequelize.query(
        `
        SELECT COUNT(*) as total
        FROM sales_items si
        LEFT JOIN products p ON si.id_product = p.id
        LEFT JOIN users prod ON p.id_user = prod.id
        LEFT JOIN students s ON si.id_student = s.id
        LEFT JOIN sales sale ON si.id_sale = sale.id
        LEFT JOIN affiliates aff ON si.id_affiliate = aff.id
        LEFT JOIN users aff_user ON aff.id_user = aff_user.id
        WHERE 1=1
        ${baseFilters}
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: baseReplacements,
        },
      );

      const totalResult = await SalesItems.sequelize.query(
        `
        SELECT COALESCE(SUM(si.price_total), 0) as total_sales
        FROM sales_items si
        LEFT JOIN products p ON si.id_product = p.id
        LEFT JOIN users prod ON p.id_user = prod.id
        LEFT JOIN students s ON si.id_student = s.id
        LEFT JOIN sales sale ON si.id_sale = sale.id
        LEFT JOIN affiliates aff ON si.id_affiliate = aff.id
        LEFT JOIN users aff_user ON aff.id_user = aff_user.id
        WHERE 1=1
        ${baseFilters}
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: baseReplacements,
        },
      );

      const total = countResult[0]?.total || 0;
      const totalSales = totalResult[0]?.total_sales || 0;

      const formattedResults = results.map((row) => ({
        id: row.id,
        uuid: row.uuid,
        created_at: row.created_at,
        price: row.price,
        id_status: row.id_status,
        payment_method: row.payment_method,
        paid_at: row.paid_at,
        price_total: row.price_total,
        price_product: row.price_product,
        type: row.type,
        id_affiliate: row.id_affiliate,
        tracking_code: row.tracking_code,
        tracking_url: row.tracking_url,
        tracking_company: row.tracking_company,
        credit_card: row.credit_card,
        valid_refund_until: row.valid_refund_until,
        id_sale: row.id_sale,
        product: row.product_name
          ? {
            name: row.product_name,
            uuid: row.product_uuid,
            support_email: row.support_email,
            support_whatsapp: row.support_whatsapp,
            id_type: row.id_type,
            payment_type: row.payment_type,
            producer: row.producer_name
              ? {
                full_name: row.producer_name,
                email: row.producer_email,
                uuid: row.producer_uuid,
              }
              : null,
          }
          : null,
        student: row.student_name
          ? {
            full_name: row.student_name,
            email: row.student_email,
            uuid: row.student_uuid,
            document_number: row.student_document,
          }
          : null,
        affiliate: row.affiliate_first_name
          ? {
            id: row.id_affiliate,
            user: {
              first_name: row.affiliate_first_name,
              last_name: row.affiliate_last_name,
              uuid: row.affiliate_uuid,
            },
          }
          : null,
        sale: row.sale_params
          ? {
            params: row.sale_params,
            id_user: row.sale_user_id,
            state_generated: row.sale_state,
          }
          : null,
      }));

      return {
        rows: formattedResults,
        count: total,
        total: Number(totalSales),
      };
    } catch (error) {
      console.error('Erro ao buscar sales com SQL direto:', error);
      return this.findOverallSales({
        end_date,
        id_status,
        page,
        size,
        start_date,
        payment_method,
        input,
      });
    }
  }

  static async findPaginatedWithSQL({
    userUuid,
    page,
    size,
    input,
    startDate,
    endDate,
    paymentMethod,
  }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = {
        start_date: startDate,
        end_date: endDate,
        payment_method: paymentMethod,
        input,
      };

      const salesWhere = {
        id_user: userUuid,
      };

      const { baseFilters, baseReplacements } =
        SalesFilters.createBaseFiltersSQL(where);
      const { salesFilters, salesReplacements } =
        SalesFilters.createSalesFiltersSQL(salesWhere);

      const results = await SalesItems.sequelize.query(
        `
        SELECT 
          si.id,
          si.uuid,
          si.created_at,
          si.price,
          si.id_status,
          si.payment_method,
          si.paid_at,
          si.price_total,
          si.price_product,
          si.type,
          si.id_affiliate,
          si.tracking_code,
          si.tracking_url,
          si.tracking_company,
          si.credit_card,
          si.valid_refund_until,
          si.id_sale,
          p.name as product_name,
          p.uuid as product_uuid,
          p.support_email,
          p.support_whatsapp,
          p.id_type,
          p.payment_type,
          prod.full_name as producer_name,
          prod.email as producer_email,
          prod.uuid as producer_uuid,
          s.full_name as student_name,
          s.email as student_email,
          s.uuid as student_uuid,
          s.document_number as student_document,
          aff_user.first_name as affiliate_first_name,
          aff_user.last_name as affiliate_last_name,
          aff_user.uuid as affiliate_uuid,
          sale.params as sale_params,
          sale.id_user as sale_user_id,
          sale.state_generated as sale_state,
          c.amount as commission_amount,
          c.id_status as commission_status,
          c.id_role as commission_role,
          c.id_user as commission_user_id,
          c.release_date as commission_release_date
        FROM sales_items si
        LEFT JOIN products p ON si.id_product = p.id
        LEFT JOIN users prod ON p.id_user = prod.id
        LEFT JOIN students s ON si.id_student = s.id
        LEFT JOIN sales sale ON si.id_sale = sale.id
        LEFT JOIN affiliates aff ON si.id_affiliate = aff.id
        LEFT JOIN users aff_user ON aff.id_user = aff_user.id
        LEFT JOIN commissions c ON si.id = c.id_sale_item AND c.id_user = :userUuid
        WHERE 1=1
        ${baseFilters}
        ${salesFilters}
        ORDER BY si.id DESC
        LIMIT :limit OFFSET :offset
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            limit,
            offset,
            userUuid,
            ...baseReplacements,
            ...salesReplacements,
          },
        },
      );

      const countResult = await SalesItems.sequelize.query(
        `
        SELECT COUNT(DISTINCT si.id) as total
        FROM sales_items si
        LEFT JOIN products p ON si.id_product = p.id
        LEFT JOIN users prod ON p.id_user = prod.id
        LEFT JOIN students s ON si.id_student = s.id
        LEFT JOIN sales sale ON si.id_sale = sale.id
        LEFT JOIN affiliates aff ON si.id_affiliate = aff.id
        LEFT JOIN users aff_user ON aff.id_user = aff_user.id
        WHERE 1=1
        ${baseFilters}
        ${salesFilters}
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            userUuid,
            ...baseReplacements,
            ...salesReplacements,
          },
        },
      );

      const total = countResult[0]?.total || 0;

      const formattedResults = results.map((row) => ({
        id: row.id,
        uuid: row.uuid,
        created_at: row.created_at,
        price: row.price,
        id_status: row.id_status,
        payment_method: row.payment_method,
        paid_at: row.paid_at,
        price_total: row.price_total,
        price_product: row.price_product,
        type: row.type,
        id_affiliate: row.id_affiliate,
        tracking_code: row.tracking_code,
        tracking_url: row.tracking_url,
        tracking_company: row.tracking_company,
        credit_card: row.credit_card,
        valid_refund_until: row.valid_refund_until,
        id_sale: row.id_sale,
        product: row.product_name
          ? {
            name: row.product_name,
            uuid: row.product_uuid,
            support_email: row.support_email,
            support_whatsapp: row.support_whatsapp,
            id_type: row.id_type,
            payment_type: row.payment_type,
            producer: row.producer_name
              ? {
                full_name: row.producer_name,
                email: row.producer_email,
                uuid: row.producer_uuid,
              }
              : null,
          }
          : null,
        student: row.student_name
          ? {
            full_name: row.student_name,
            email: row.student_email,
            uuid: row.student_uuid,
            document_number: row.student_document,
          }
          : null,
        affiliate: row.affiliate_first_name
          ? {
            id: row.id_affiliate,
            user: {
              first_name: row.affiliate_first_name,
              last_name: row.affiliate_last_name,
              uuid: row.affiliate_uuid,
            },
          }
          : null,
        sale: row.sale_params
          ? {
            params: row.sale_params,
            id_user: row.sale_user_id,
            state_generated: row.sale_state,
          }
          : null,
        commissions: row.commission_amount
          ? [
            {
              amount: row.commission_amount,
              id_status: row.commission_status,
              id_role: row.commission_role,
              id_user: row.commission_user_id,
              release_date: row.commission_release_date,
            },
          ]
          : [],
      }));

      return {
        rows: formattedResults,
        count: total,
      };
    } catch (error) {
      console.error('Erro ao buscar sales paginadas com SQL direto:', error);
      return this.findSalesPaginated({
        userUuid,
        page,
        size,
        input,
        startDate,
        endDate,
        paymentMethod,
      });
    }
  }

  static async findSaleTransactionsWithSQL(saleUuid) {
    try {
      const results = await SalesItems.sequelize.query(
        `
        SELECT 
          si.id,
          si.uuid,
          si.price_product,
          si.valid_refund_until,
          si.payment_method,
          si.uuid as sale_item_uuid,
          si.price_total,
          si.id_sale,
          si.id_student,
          si.id_product,
          si.id_affiliate,
          si.id_status,
          si.created_at,
          si.updated_at,
          si.paid_at,
          si.type,
          si.tracking_code,
          si.tracking_url,
          si.tracking_company,
          si.credit_card,
          p.name as product_name,
          p.uuid as product_uuid,
          p.support_email,
          p.support_whatsapp,
          p.id_type,
          p.payment_type,
          prod.full_name as producer_name,
          prod.email as producer_email,
          prod.uuid as producer_uuid,
          s.full_name as student_name,
          s.email as student_email,
          s.uuid as student_uuid,
          s.document_number as student_document,
          aff_user.first_name as affiliate_first_name,
          aff_user.last_name as affiliate_last_name,
          aff_user.uuid as affiliate_uuid,
          sale.params as sale_params,
          sale.id_user as sale_user_id,
          sale.state_generated as sale_state,
          c.id as commission_id,
          c.amount as commission_amount,
          c.id_status as commission_status,
          c.id_role as commission_role,
          c.id_user as commission_user_id,
          c.release_date as commission_release_date,
          c_user.full_name as commission_user_name,
          c_user.uuid as commission_user_uuid,
          ch.installments as charge_installments,
          ch.price as charge_price,
          ch.psp_id as charge_psp_id,
          ch.provider as charge_provider,
          ch.provider_id as charge_provider_id,
          ch.billet_url as charge_billet_url,
          ch.uuid as charge_uuid,
          ch.provider_response_details as charge_provider_response_details,
          ref.created_at as refund_created_at,
          ref.id_status as refund_status,
          ref.updated_at as refund_updated_at,
          ref.reason as refund_reason,
          ref.amount as refund_amount,
          rc.id as referral_commission_id,
          rc.amount as referral_commission_amount,
          rc.id_status as referral_commission_status,
          rc.release_date as referral_commission_release_date,
          rc_user.full_name as referral_commission_user_name,
          rc_user.uuid as referral_commission_user_uuid,
          cs.id as coupon_sale_id,
          cs.coupon_id as coupon_id,
          cp.code as coupon_code,
          cp.discount_type as coupon_discount_type,
          cp.discount_value as coupon_discount_value
        FROM sales_items si
        LEFT JOIN products p ON si.id_product = p.id
        LEFT JOIN users prod ON p.id_producer = prod.id
        LEFT JOIN students s ON si.id_student = s.id
        LEFT JOIN sales sale ON si.id_sale = sale.id
        LEFT JOIN affiliates aff ON si.id_affiliate = aff.id
        LEFT JOIN users aff_user ON aff.id_user = aff_user.id
        LEFT JOIN commissions c ON si.id = c.id_sale_item
        LEFT JOIN users c_user ON c.id_user = c_user.id
        LEFT JOIN charges ch ON si.id = ch.id_sale_item
        LEFT JOIN refunds ref ON si.id = ref.id_sale_item
        LEFT JOIN referral_commissions rc ON si.id = rc.id_sale_item
        LEFT JOIN users rc_user ON rc.id_user = rc_user.id
        LEFT JOIN coupon_sales cs ON si.id = cs.id_sale_item
        LEFT JOIN coupons cp ON cs.coupon_id = cp.id
        WHERE si.uuid = :saleUuid
        ORDER BY c.id ASC, ch.id ASC, ref.id ASC, rc.id ASC, cs.id ASC
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: { saleUuid },
        },
      );

      if (!results || results.length === 0) {
        return null;
      }

      const saleItem = {
        id: results[0].id,
        uuid: results[0].sale_item_uuid,
        price_product: results[0].price_product,
        valid_refund_until: results[0].valid_refund_until,
        payment_method: results[0].payment_method,
        price_total: results[0].price_total,
        id_sale: results[0].id_sale,
        id_student: results[0].id_student,
        id_product: results[0].id_product,
        id_affiliate: results[0].id_affiliate,
        id_status: results[0].id_status,
        created_at: results[0].created_at,
        updated_at: results[0].updated_at,
        paid_at: results[0].paid_at,
        type: results[0].type,
        tracking_code: results[0].tracking_code,
        tracking_url: results[0].tracking_url,
        tracking_company: results[0].tracking_company,
        credit_card: results[0].credit_card,
        product: results[0].product_name
          ? {
            name: results[0].product_name,
            uuid: results[0].product_uuid,
            support_email: results[0].support_email,
            support_whatsapp: results[0].support_whatsapp,
            id_type: results[0].id_type,
            payment_type: results[0].payment_type,
            producer: results[0].producer_name
              ? {
                full_name: results[0].producer_name,
                email: results[0].producer_email,
                uuid: results[0].producer_uuid,
              }
              : null,
          }
          : null,
        student: results[0].student_name
          ? {
            full_name: results[0].student_name,
            email: results[0].student_email,
            uuid: results[0].student_uuid,
            document_number: results[0].student_document,
          }
          : null,
        affiliate: results[0].affiliate_first_name
          ? {
            id: results[0].id_affiliate,
            user: {
              first_name: results[0].affiliate_first_name,
              last_name: results[0].affiliate_last_name,
              uuid: results[0].affiliate_uuid,
            },
          }
          : null,
        sale: results[0].sale_params
          ? {
            params: results[0].sale_params,
            id_user: results[0].sale_user_id,
            state_generated: results[0].sale_state,
          }
          : null,
        commissions: [],
        charges: [],
        refund: null,
        referral_commission: null,
        coupon_sale: null,
      };

      const processedCommissions = new Set();
      const processedCharges = new Set();
      const processedRefunds = new Set();
      const processedReferralCommissions = new Set();
      const processedCouponSales = new Set();

      results.forEach((row) => {
        if (row.commission_id && !processedCommissions.has(row.commission_id)) {
          processedCommissions.add(row.commission_id);
          saleItem.commissions.push({
            id: row.commission_id,
            amount: row.commission_amount,
            id_status: row.commission_status,
            id_role: row.commission_role,
            id_user: row.commission_user_id,
            release_date: row.commission_release_date,
            user: {
              full_name: row.commission_user_name,
              uuid: row.commission_user_uuid,
            },
          });
        }

        if (row.charge_uuid && !processedCharges.has(row.charge_uuid)) {
          processedCharges.add(row.charge_uuid);
          saleItem.charges.push({
            installments: row.charge_installments,
            price: row.charge_price,
            psp_id: row.charge_psp_id,
            provider: row.charge_provider,
            provider_id: row.charge_provider_id,
            billet_url: row.charge_billet_url,
            uuid: row.charge_uuid,
            provider_response_details: row.charge_provider_response_details,
          });
        }

        if (
          row.refund_created_at &&
          !processedRefunds.has(row.refund_created_at)
        ) {
          processedRefunds.add(row.refund_created_at);
          saleItem.refund = {
            created_at: row.refund_created_at,
            id_status: row.refund_status,
            updated_at: row.refund_updated_at,
            reason: row.refund_reason,
            amount: row.refund_amount,
          };
        }

        if (
          row.referral_commission_id &&
          !processedReferralCommissions.has(row.referral_commission_id)
        ) {
          processedReferralCommissions.add(row.referral_commission_id);
          saleItem.referral_commission = {
            id: row.referral_commission_id,
            amount: row.referral_commission_amount,
            id_status: row.referral_commission_status,
            release_date: row.referral_commission_release_date,
            user: {
              full_name: row.referral_commission_user_name,
              uuid: row.referral_commission_user_uuid,
            },
          };
        }

        if (
          row.coupon_sale_id &&
          !processedCouponSales.has(row.coupon_sale_id)
        ) {
          processedCouponSales.add(row.coupon_sale_id);
          saleItem.coupon_sale = {
            id: row.coupon_sale_id,
            coupon_id: row.coupon_id,
            coupon: {
              code: row.coupon_code,
              discount_type: row.coupon_discount_type,
              discount_value: row.coupon_discount_value,
            },
          };
        }
      });

      return saleItem;
    } catch (error) {
      console.error(
        'Erro ao buscar transações de venda com SQL direto:',
        error,
      );
      return this.findSaleTransactions(saleUuid);
    }
  }

  static async findAll(options = {}) {
    try {
      const salesItems = await SalesItems.findAll(options);
      return salesItems;
    } catch (error) {
      console.error('Erro ao buscar sales items:', error);
      throw error;
    }
  }
};