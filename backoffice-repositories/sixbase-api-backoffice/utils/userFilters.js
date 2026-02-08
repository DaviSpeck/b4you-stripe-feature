const { Op } = require('sequelize');

class UserFilters {
  /**
   * @param {Object} 
   * @returns {string} 
   */
  static createSearchFilterSQL(where) {
    if (!where.input) return '';

    const trimmedInput = where.input.trim();
    let searchConditions = [];

    searchConditions.push('u.full_name LIKE :search_input');

    searchConditions.push('u.email LIKE :search_input');

    searchConditions.push('u.document_number LIKE :search_input');
    searchConditions.push('u.cnpj LIKE :search_input');

    return `AND (${searchConditions.join(' OR ')})`;
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createSearchFilterSequelize(where) {
    if (!where.input) return {};

    const trimmedInput = where.input.trim();
    const orObject = {
      full_name: { [Op.like]: `%${trimmedInput}%` },
      email: { [Op.like]: `%${trimmedInput}%` },
    };

    const sanitizedInput = where.input.replace(/[^\d]/g, '');
    if (sanitizedInput.length > 0 && !/[a-zA-Z]/gm.test(trimmedInput)) {
      orObject.document_number = { [Op.like]: `%${sanitizedInput}%` };
      orObject.cnpj = { [Op.like]: `%${sanitizedInput}%` };
    }

    return {
      [Op.or]: orObject,
    };
  }

  /**
   * @param {Object} 
   * @returns {string} 
   */
  static createFollowUpFilterSQL(where) {
    if (
      where.follow_up !== undefined &&
      where.follow_up !== null &&
      where.follow_up !== ''
    ) {
      return 'AND u.follow_up = :follow_up';
    }
    return '';
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createFollowUpFilterSequelize(where) {
    const filters = {};

    if (
      where.follow_up !== undefined &&
      where.follow_up !== null &&
      where.follow_up !== ''
    ) {
      filters.follow_up = where.follow_up;
    }

    return filters;
  }

  /**
   * @param {Object} 
   * @returns {string} 
   */
  static createBlockedWithdrawalFilterSQL(where) {
    if (
      where.blocked_withdrawal !== undefined &&
      where.blocked_withdrawal !== null &&
      where.blocked_withdrawal !== ''
    ) {
      return 'AND ws.blocked = :blocked_withdrawal';
    }
    return '';
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createBlockedWithdrawalFilterSequelize(where) {
    const filters = {};

    if (
      where.blocked_withdrawal !== undefined &&
      where.blocked_withdrawal !== null &&
      where.blocked_withdrawal !== ''
    ) {
      filters['$withdrawals_settings.blocked$'] = where.blocked_withdrawal;
    }

    return filters;
  }

  /**
   * @param {Object} 
   * @returns {string} 
   */
  static createNegativeBalanceFilterSQL(where) {
    if (
      where.negative_balance !== undefined &&
      where.negative_balance !== null &&
      where.negative_balance !== ''
    ) {
      return 'AND b.amount < 0';
    }
    return '';
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createNegativeBalanceFilterSequelize(where) {
    const filters = {};

    if (
      where.negative_balance !== undefined &&
      where.negative_balance !== null &&
      where.negative_balance !== ''
    ) {
      filters['$balance.amount$'] = { [Op.lt]: 0 };
    }

    return filters;
  }

  static createDateRangeFilterSQL(where) {
    const col = where.date_column || 'uba.created_at';
    const toDateOrNull = (v) => {
      if (!v) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    const start = toDateOrNull(where.start_date);
    const end = toDateOrNull(where.end_date);

    if (!start && !end) return { sql: '', replacements: {} };

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    const parts = [];
    const repl = {};
    if (start) {
      parts.push(`${col} >= :startDate`);
      repl.startDate = start;
    }
    if (end) {
      parts.push(`${col} <= :endDate`);
      repl.endDate = end;
    }

    return { sql: `AND (${parts.join(' AND ')})`, replacements: repl };
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createBaseFiltersSQL(where) {
    const baseFilters = [];
    const baseReplacements = {};

    const searchFilter = this.createSearchFilterSQL(where);
    if (searchFilter) {
      baseFilters.push(searchFilter);
      if (where.input) {
        baseReplacements.search_input = `%${where.input.trim()}%`;
      }
    }

    const followUpFilter = this.createFollowUpFilterSQL(where);
    if (followUpFilter) {
      baseFilters.push(followUpFilter);
      if (where.follow_up !== undefined) {
        baseReplacements.follow_up = where.follow_up;
      }
    }

    const blockedWithdrawalFilter =
      this.createBlockedWithdrawalFilterSQL(where);
    if (blockedWithdrawalFilter) {
      baseFilters.push(blockedWithdrawalFilter);
      if (where.blocked_withdrawal !== undefined) {
        baseReplacements.blocked_withdrawal = where.blocked_withdrawal;
      }
    }

    const negativeBalanceFilter = this.createNegativeBalanceFilterSQL(where);
    if (negativeBalanceFilter) {
      baseFilters.push(negativeBalanceFilter);
    }

    const { sql: dateSql, replacements: dateRepl } = this.createDateRangeFilterSQL(where);
    if (dateSql) baseFilters.push(dateSql);
    Object.assign(baseReplacements, dateRepl);

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
    const userWhere = {};

    Object.assign(userWhere, this.createSearchFilterSequelize(where));
    Object.assign(userWhere, this.createFollowUpFilterSequelize(where));
    Object.assign(
      userWhere,
      this.createBlockedWithdrawalFilterSequelize(where),
    );
    Object.assign(userWhere, this.createNegativeBalanceFilterSequelize(where));

    return userWhere;
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createAllFiltersSQL(where) {
    return this.createBaseFiltersSQL(where);
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createAllFiltersSequelize(where) {
    return this.createBaseFiltersSequelize(where);
  }
}

module.exports = UserFilters;
