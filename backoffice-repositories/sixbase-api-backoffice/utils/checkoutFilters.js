const { Op } = require('sequelize');
const { regionToStates } = require('../mocks/region.mock');
const dateHelper = require('./helpers/date');

class CheckoutFilters {
  static _normalizeDateRange(where = {}) {
    const { start_date, end_date } = where || {};
    if (!start_date || !end_date) {
      return { startUtc: null, endUtc: null };
    }
    const startUtc = dateHelper(start_date).startOf('day').utc().toDate();
    const endUtc = dateHelper(end_date).endOf('day').utc().toDate();
    return { startUtc, endUtc };
  }

  static createRegionFilterSQL(saleWhere) {
    let regionFilter = '';
    let regionReplacements = {};

    if (saleWhere.state_generated) {
      return { regionFilter, regionReplacements };
    }

    if (saleWhere.region && regionToStates[saleWhere.region]) {
      regionFilter =
        "AND JSON_UNQUOTE(JSON_EXTRACT(s.address, '$.state')) IN (:region_states)";
      regionReplacements.region_states = regionToStates[saleWhere.region];
    }

    return { regionFilter, regionReplacements };
  }

  static createRegionFilterSequelize(saleWhere) {
    const salesWhere = { ...saleWhere };

    if (saleWhere.state_generated) {
      // Usar campo JSON para filtrar por estado
      salesWhere['$address.state$'] = saleWhere.state_generated;
      delete salesWhere.state_generated;
      return salesWhere;
    }

    if (saleWhere.region && regionToStates[saleWhere.region]) {
      salesWhere['$address.state$'] = {
        [Op.in]: regionToStates[saleWhere.region],
      };
    }

    return salesWhere;
  }

  static createPaymentMethodFilterSQL(where) {
    let paymentMethodFilter = '';
    let paymentReplacements = {};

    if (where.payment_method && where.payment_method !== 'all') {
      paymentMethodFilter = 'AND si.payment_method = :payment_method';
      paymentReplacements.payment_method = where.payment_method;
    }

    return { paymentMethodFilter, paymentReplacements };
  }

  static createPaymentMethodFilterSequelize(where) {
    const salesItemsWhere = {};

    if (where.payment_method && where.payment_method !== 'all') {
      salesItemsWhere.payment_method = where.payment_method;
    }

    return salesItemsWhere;
  }

  static createStateVsRegionFilterSQL(saleWhere) {
    if (saleWhere.state_generated) {
      return "AND JSON_UNQUOTE(JSON_EXTRACT(s.address, '$.state')) = :state_generated";
    }
    return '';
  }

  static createDateFilterSQL(where) {
    const { startUtc, endUtc } = this._normalizeDateRange(where);
    if (startUtc && endUtc) {
      return 'AND si.created_at BETWEEN :start_date AND :end_date';
    }
    return '';
  }

  static createDateFilterSequelize(where) {
    const filters = {};
    const { startUtc, endUtc } = this._normalizeDateRange(where);

    if (startUtc && endUtc) {
      filters.created_at = {
        [Op.between]: [startUtc, endUtc],
      };
    }

    return filters;
  }

  static createStatusFilterSQL(where) {
    if (where.id_status && Array.isArray(where.id_status)) {
      return 'AND si.id_status IN (:id_status)';
    } else if (where.id_status) {
      return 'AND si.id_status = :id_status';
    }
    return '';
  }

  static createStatusFilterSequelize(where) {
    const filters = {};

    if (where.id_status) {
      if (Array.isArray(where.id_status)) {
        filters.id_status = { [Op.in]: where.id_status };
      } else {
        filters.id_status = where.id_status;
      }
    }

    return filters;
  }

  static createProductFilterSQL(where) {
    let productFilter = '';
    let productReplacements = {};

    if (where.id_product) {
      if (Array.isArray(where.id_product)) {
        if (where.id_product.length > 0) {
          productFilter = 'AND si.id_product IN (:product_ids)';
          productReplacements.product_ids = where.id_product;
        }
      } else {
        productFilter = 'AND si.id_product = :id_product';
        productReplacements.id_product = where.id_product;
      }
    }
    if (where.product_name) {
      productFilter += ' AND p.name LIKE :product_name';
      productReplacements.product_name = `%${where.product_name}%`;
    }

    return { productFilter, productReplacements };
  }

  static createProductFilterSequelize(where) {
    const salesItemsWhere = {};
    let productIncludeWhere = {};

    if (where.id_product) {
      if (Array.isArray(where.id_product)) {
        if (where.id_product.length > 0) {
          salesItemsWhere.id_product = { [Op.in]: where.id_product };
        }
      } else {
        salesItemsWhere.id_product = where.id_product;
      }
    }

    if (where.product_name) {
      productIncludeWhere.name = { [Op.like]: `%${where.product_name}%` };
    }

    return { salesItemsWhere, productIncludeWhere };
  }

  static createBaseFiltersSQL(where) {
    const baseFilters = [];
    const baseReplacements = {};

    const dateFilter = this.createDateFilterSQL(where);
    if (dateFilter) {
      baseFilters.push(dateFilter);
      const { startUtc, endUtc } = this._normalizeDateRange(where);
      baseReplacements.start_date = startUtc;
      baseReplacements.end_date = endUtc;
    }

    const { productFilter, productReplacements } =
      this.createProductFilterSQL(where);
    if (productFilter) {
      baseFilters.push(productFilter);
      Object.assign(baseReplacements, productReplacements);
    }

    const statusFilter = this.createStatusFilterSQL(where);
    if (statusFilter) {
      baseFilters.push(statusFilter);
    }

    const { paymentMethodFilter, paymentReplacements } =
      this.createPaymentMethodFilterSQL(where);
    if (paymentMethodFilter) {
      baseFilters.push(paymentMethodFilter);
      Object.assign(baseReplacements, paymentReplacements);
    }

    return {
      baseFilters: baseFilters.join(' '),
      baseReplacements,
    };
  }

  static createBaseFiltersSequelize(where) {
    const salesItemsWhere = {};

    Object.assign(salesItemsWhere, this.createDateFilterSequelize(where));
    Object.assign(salesItemsWhere, this.createStatusFilterSequelize(where));
    Object.assign(
      salesItemsWhere,
      this.createPaymentMethodFilterSequelize(where),
    );
    Object.assign(
      salesItemsWhere,
      this.createProductFilterSequelize(where).salesItemsWhere,
    );

    return salesItemsWhere;
  }

  static createSalesFiltersSQL(saleWhere) {
    const salesFilters = [];
    const salesReplacements = {};

    if (saleWhere.state_generated) {
      salesFilters.push(
        "AND JSON_UNQUOTE(JSON_EXTRACT(s.address, '$.state')) = :state_generated",
      );
      salesReplacements.state_generated = saleWhere.state_generated;
    } else if (saleWhere.region && regionToStates[saleWhere.region]) {
      salesFilters.push(
        "AND JSON_UNQUOTE(JSON_EXTRACT(s.address, '$.state')) IN (:region_states)",
      );
      salesReplacements.region_states = regionToStates[saleWhere.region];
    }

    if (saleWhere.id_user) {
      salesFilters.push('AND s.id_user = :id_user');
      salesReplacements.id_user = saleWhere.id_user;
    }

    return {
      salesFilters: salesFilters.join(' '),
      salesReplacements,
    };
  }

  static createSalesFiltersSequelize(saleWhere) {
    let salesWhere = {};

    if (saleWhere.id_user) {
      salesWhere.id_user = saleWhere.id_user;
    }

    if (saleWhere.state_generated) {
      salesWhere.state_generated = saleWhere.state_generated;
      return salesWhere;
    }

    if (saleWhere.region && regionToStates[saleWhere.region]) {
      salesWhere.state_generated = {
        [Op.in]: regionToStates[saleWhere.region],
      };
    }

    return salesWhere;
  }

  static createAllFiltersSQL(where, saleWhere) {
    const { baseFilters, baseReplacements } = this.createBaseFiltersSQL(where);
    const { salesFilters, salesReplacements } =
      this.createSalesFiltersSQL(saleWhere);

    const safeWhere = {};
    if (Array.isArray(where?.id_status) && where.id_status.length)
      safeWhere.id_status = where.id_status;
    if (where?.id_product) safeWhere.id_product = where.id_product;
    if (where?.payment_method && where.payment_method !== 'all')
      safeWhere.payment_method = where.payment_method;
    if (where?.product_name) safeWhere.product_name = where.product_name;

    return {
      filters: `${baseFilters} ${salesFilters}`.trim(),
      replacements: { ...salesReplacements, ...safeWhere, ...baseReplacements },
    };
  }

  static createAllFiltersSequelize(where, saleWhere) {
    const salesItemsWhere = this.createBaseFiltersSequelize(where);
    const salesWhere = this.createSalesFiltersSequelize(saleWhere);

    return { salesItemsWhere, salesWhere };
  }
}

module.exports = CheckoutFilters;
