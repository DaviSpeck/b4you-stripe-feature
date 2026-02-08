const { Op } = require('sequelize');
const dateHelper = require('./helpers/date');

class SalesFilters {
  static _normalizeDateRange(where = {}) {
    const { start_date, end_date } = where || {};
    if (!start_date || !end_date) {
      return { startUtc: null, endUtc: null };
    }

    const startUtc = dateHelper(start_date)
      .utcOffset(-180, true)
      .startOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss');

    const endExclusiveUtc = dateHelper(end_date)
      .utcOffset(-180, true)
      .add(1, 'day')
      .startOf('day')
      .utc()
      .format('YYYY-MM-DD HH:mm:ss');

    return { startUtc, endExclusiveUtc };
  }
  /**
   * @param {Object}
   * @returns {string}
   */
  static createDateFilterSQL(where) {
    const { startUtc, endExclusiveUtc } = this._normalizeDateRange(where);
    if (startUtc && endExclusiveUtc) {
      return 'AND si.created_at >= :start_date AND si.created_at < :end_exclusive';
    }
    return '';
  }

  /**
   * @param {Object}
   * @returns {Object}
   */
  static createDateFilterSequelize(where) {
    const filters = {};

    const { startUtc, endExclusiveUtc } = this._normalizeDateRange(where);
    if (startUtc && endExclusiveUtc) {
      filters.created_at = {
        [Op.gte]: startUtc,
        [Op.lt]: endExclusiveUtc,
      };
    }

    return filters;
  }

  /**
   * @param {Object}
   * @returns {string}
   */
  static createStatusFilterSQL(where) {
    if (where.id_status && Array.isArray(where.id_status)) {
      return 'AND si.id_status IN (:id_status)';
    } else if (where.id_status && where.id_status !== 'all') {
      return 'AND si.id_status = :id_status';
    }
    return '';
  }

  /**
   * @param {Object}
   * @returns {Object}
   */
  static createStatusFilterSequelize(where) {
    const filters = {};

    if (where.id_status && where.id_status !== 'all') {
      if (Array.isArray(where.id_status)) {
        filters.id_status = { [Op.in]: where.id_status };
      } else {
        filters.id_status = where.id_status;
      }
    }

    return filters;
  }

  /**
   * @param {Object}
   * @returns {string}
   */
  static createPaymentMethodFilterSQL(where) {
    if (where.payment_method && where.payment_method !== 'all') {
      return 'AND si.payment_method = :payment_method';
    }
    return '';
  }

  /**
   * @param {Object}
   * @returns {Object}
   */
  static createPaymentMethodFilterSequelize(where) {
    const filters = {};

    if (where.payment_method && where.payment_method !== 'all') {
      filters.payment_method = where.payment_method;
    }

    return filters;
  }

  /**
   * @param {Object}
   * @returns {string}
   */
  static createSearchFilterSQL(where) {
    if (!where.input || where.input.trim() === '') return '';

    const trimmedInput = where.input.trim();
    let searchConditions = [];

    searchConditions.push('si.uuid LIKE :search_input');

    searchConditions.push('p.name LIKE :search_input');

    searchConditions.push('p.uuid LIKE :search_input');

    searchConditions.push('s.full_name LIKE :search_input');

    searchConditions.push('s.email LIKE :search_input');

    searchConditions.push('s.uuid LIKE :search_input');

    searchConditions.push('s.document_number LIKE :search_input');

    searchConditions.push('aff_user.full_name LIKE :search_input');

    return `AND (${searchConditions.join(' OR ')})`;
  }

  /**
   * @param {Object}
   * @returns {Object}
   */
  static createSearchFilterSequelize(where) {
    if (!where.input || where.input.trim() === '') return {};

    const trimmedInput = where.input.trim();
    const orObject = {
      uuid: { [Op.like]: `%${trimmedInput}%` },
      '$product.name$': { [Op.like]: `%${trimmedInput}%` },
      '$product.uuid$': { [Op.like]: `%${trimmedInput}%` },
      '$student.full_name$': { [Op.like]: `%${trimmedInput}%` },
      '$student.email$': { [Op.like]: `%${trimmedInput}%` },
      '$student.uuid$': { [Op.like]: `%${trimmedInput}%` },
      '$student.document_number$': { [Op.like]: `%${trimmedInput}%` },
      '$affiliate.user.full_name$': { [Op.like]: `%${trimmedInput}%` },
    };

    return {
      [Op.or]: orObject,
    };
  }

  /**
   * @param {Object}
   * @returns {Object}
   */
  static createBaseFiltersSQL(where) {
    const baseFilters = [];
    const baseReplacements = {};

    const dateFilter = this.createDateFilterSQL(where);
    if (dateFilter) {
      baseFilters.push(dateFilter);
      const { startUtc, endExclusiveUtc } = this._normalizeDateRange(where);
      baseReplacements.start_date = startUtc;
      baseReplacements.end_exclusive = endExclusiveUtc;
    }

    const statusFilter = this.createStatusFilterSQL(where);
    if (statusFilter) {
      baseFilters.push(statusFilter);
      if (where.id_status && where.id_status !== 'all') {
        if (Array.isArray(where.id_status)) {
          baseReplacements.id_status = where.id_status;
        } else {
          baseReplacements.id_status = where.id_status;
        }
      }
    }

    const paymentMethodFilter = this.createPaymentMethodFilterSQL(where);
    if (paymentMethodFilter) {
      baseFilters.push(paymentMethodFilter);
      if (where.payment_method && where.payment_method !== 'all') {
        baseReplacements.payment_method = where.payment_method;
      }
    }

    const searchFilter = this.createSearchFilterSQL(where);
    if (searchFilter) {
      baseFilters.push(searchFilter);
      if (where.input && where.input.trim() !== '') {
        baseReplacements.search_input = `%${where.input.trim()}%`;
      }
    }

    return {
      baseFilters: baseFilters.join(' '),
      baseReplacements,
    };
  }

  /**
   * @param {Object}
   * @returns {Object}
   */
  static createBaseFiltersSequelize(where) {
    const salesItemsWhere = {};

    Object.assign(salesItemsWhere, this.createDateFilterSequelize(where));
    Object.assign(salesItemsWhere, this.createStatusFilterSequelize(where));
    Object.assign(
      salesItemsWhere,
      this.createPaymentMethodFilterSequelize(where),
    );
    Object.assign(salesItemsWhere, this.createSearchFilterSequelize(where));

    return salesItemsWhere;
  }

  /**
   * @param {Object}
   * @returns {Object}
   */
  static createSalesFiltersSQL(where) {
    const salesFilters = [];
    const salesReplacements = {};

    if (where.id_user) {
      salesFilters.push('AND s.id_user = :id_user');
      salesReplacements.id_user = where.id_user;
    }

    if (where.state_generated) {
      salesFilters.push(
        "AND JSON_UNQUOTE(JSON_EXTRACT(s.address, '$.state')) = :state_generated",
      );
      salesReplacements.state_generated = where.state_generated;
    }

    return {
      salesFilters: salesFilters.join(' '),
      salesReplacements,
    };
  }

  /**
   * @param {Object}
   * @returns {Object}
   */
  static createSalesFiltersSequelize(where) {
    const salesWhere = {};

    if (where.id_user) {
      salesWhere.id_user = where.id_user;
    }

    if (where.state_generated) {
      salesWhere.state_generated = where.state_generated;
    }

    return salesWhere;
  }

  /**
   * @param {Object}
   * @param {Object}
   * @returns {Object}
   */
  static createAllFiltersSQL(where, salesWhere = {}) {
    const { baseFilters, baseReplacements } = this.createBaseFiltersSQL(where);
    const { salesFilters, salesReplacements } =
      this.createSalesFiltersSQL(salesWhere);

    return {
      filters: `${baseFilters} ${salesFilters}`.trim(),
      replacements: { ...baseReplacements, ...salesReplacements },
    };
  }

  /**
   * @param {Object}
   * @param {Object}
   * @returns {Object}
   */
  static createAllFiltersSequelize(where, salesWhere = {}) {
    const salesItemsWhere = this.createBaseFiltersSequelize(where);
    const salesWhereFilters = this.createSalesFiltersSequelize(salesWhere);

    return { salesItemsWhere, salesWhereFilters };
  }
}

module.exports = SalesFilters;
