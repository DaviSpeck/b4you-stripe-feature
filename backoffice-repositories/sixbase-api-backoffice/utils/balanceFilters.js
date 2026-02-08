const { Op } = require('sequelize');

class BalanceFilters {
  static createUserFilterSQL(where) {
    if (!where.id_user) return '';
    return `AND id_user = :id_user`;
  }

  static createTransactionTypeFilterSQL(where) {
    if (!where.id_type) return '';
    return `AND id_type = :id_type`;
  }

  static createTransactionStatusFilterSQL(where) {
    if (!where.id_status) return '';
    if (Array.isArray(where.id_status)) {
      return `AND id_status IN (:id_status)`;
    }
    return `AND id_status = :id_status`;
  }

  static createDateFilterSQL(where) {
    if (!where.start_date || !where.end_date) return '';
    return `AND created_at BETWEEN :start_date AND :end_date`;
  }

  static createLast30DaysFilterSQL(where) {
    if (!where.last_30_days) return '';
    return `AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
  }

  static createBaseFiltersSQL(where) {
    let filters = '';
    let replacements = {};

    if (where.id_user) {
      filters += this.createUserFilterSQL(where);
      replacements.id_user = where.id_user;
    }

    if (where.id_type) {
      filters += this.createTransactionTypeFilterSQL(where);
      replacements.id_type = where.id_type;
    }

    if (where.id_status) {
      filters += this.createTransactionStatusFilterSQL(where);
      replacements.id_status = where.id_status;
    }

    if (where.start_date && where.end_date) {
      filters += this.createDateFilterSQL(where);
      replacements.start_date = where.start_date;
      replacements.end_date = where.end_date;
    }

    if (where.last_30_days) {
      filters += this.createLast30DaysFilterSQL(where);
    }

    return { filters, replacements };
  }

  static createAllFiltersSQL(where) {
    return this.createBaseFiltersSQL(where);
  }

  // ========== SEQUELIZE FILTERS ==========

  static createUserFilterSequelize(where) {
    if (!where.id_user) return {};
    return { id_user: where.id_user };
  }

  static createTransactionTypeFilterSequelize(where) {
    if (!where.id_type) return {};
    return { id_type: where.id_type };
  }

  static createTransactionStatusFilterSequelize(where) {
    if (!where.id_status) return {};
    if (Array.isArray(where.id_status)) {
      return { id_status: { [Op.in]: where.id_status } };
    }
    return { id_status: where.id_status };
  }

  static createDateFilterSequelize(where) {
    if (!where.start_date || !where.end_date) return {};
    return {
      created_at: {
        [Op.between]: [where.start_date, where.end_date],
      },
    };
  }

  static createLast30DaysFilterSequelize(where) {
    if (!where.last_30_days) return {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return {
      created_at: {
        [Op.gte]: thirtyDaysAgo,
      },
    };
  }

  static createBaseFiltersSequelize(where) {
    let filters = {};

    if (where.id_user) {
      filters = { ...filters, ...this.createUserFilterSequelize(where) };
    }

    if (where.id_type) {
      filters = {
        ...filters,
        ...this.createTransactionTypeFilterSequelize(where),
      };
    }

    if (where.id_status) {
      filters = {
        ...filters,
        ...this.createTransactionStatusFilterSequelize(where),
      };
    }

    if (where.start_date && where.end_date) {
      filters = { ...filters, ...this.createDateFilterSequelize(where) };
    }

    if (where.last_30_days) {
      filters = { ...filters, ...this.createLast30DaysFilterSequelize(where) };
    }

    return filters;
  }

  static createAllFiltersSequelize(where) {
    return this.createBaseFiltersSequelize(where);
  }
}

module.exports = BalanceFilters;
