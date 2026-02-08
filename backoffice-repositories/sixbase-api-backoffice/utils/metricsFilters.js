const { Op } = require('sequelize');

class MetricsFilters {
  static createStartDateFilterSQL(where) {
    if (!where.start_date) return '';
    return `AND si.created_at >= :start_date`;
  }

  static createEndDateFilterSQL(where) {
    if (!where.end_date) return '';
    return `AND si.created_at <= :end_date`;
  }

  static createStatusFilterSQL(where) {
    if (!where.id_status) return '';
    if (Array.isArray(where.id_status)) {
      return `AND si.id_status IN (:id_status)`;
    }
    return `AND si.id_status = :id_status`;
  }

  static createPaymentMethodFilterSQL(where) {
    if (!where.payment_method) return '';
    return `AND si.payment_method = :payment_method`;
  }

  static createUserFilterSQL(where) {
    if (!where.id_user) return '';
    return `AND si.id_user = :id_user`;
  }

  static createProductFilterSQL(where) {
    if (!where.id_product) return '';
    return `AND si.id_product = :id_product`;
  }

  static createProducerFilterSQL(where) {
    if (!where.id_producer) return '';
    return `AND p.id_user = :id_producer`;
  }

  static createBaseFiltersSQL(where) {
    let filters = '';
    let replacements = {};

    if (where.start_date) {
      filters += this.createStartDateFilterSQL(where);
      replacements.start_date = where.start_date;
    }

    if (where.end_date) {
      filters += this.createEndDateFilterSQL(where);
      replacements.end_date = where.end_date;
    }

    if (where.id_status) {
      filters += this.createStatusFilterSQL(where);
      replacements.id_status = where.id_status;
    }

    if (where.payment_method) {
      filters += this.createPaymentMethodFilterSQL(where);
      replacements.payment_method = where.payment_method;
    }

    if (where.id_user) {
      filters += this.createUserFilterSQL(where);
      replacements.id_user = where.id_user;
    }

    if (where.id_product) {
      filters += this.createProductFilterSQL(where);
      replacements.id_product = where.id_product;
    }

    if (where.id_producer) {
      filters += this.createProducerFilterSQL(where);
      replacements.id_producer = where.id_producer;
    }

    return { filters, replacements };
  }

  static createAllFiltersSQL(where) {
    return this.createBaseFiltersSQL(where);
  }

  // ========== SEQUELIZE FILTERS ==========

  static createStartDateFilterSequelize(where) {
    if (!where.start_date) return {};
    return {
      created_at: {
        [Op.gte]: where.start_date,
      },
    };
  }

  static createEndDateFilterSequelize(where) {
    if (!where.end_date) return {};
    return {
      created_at: {
        [Op.lte]: where.end_date,
      },
    };
  }

  static createStatusFilterSequelize(where) {
    if (!where.id_status) return {};
    if (Array.isArray(where.id_status)) {
      return { id_status: { [Op.in]: where.id_status } };
    }
    return { id_status: where.id_status };
  }

  static createPaymentMethodFilterSequelize(where) {
    if (!where.payment_method) return {};
    return { payment_method: where.payment_method };
  }

  static createUserFilterSequelize(where) {
    if (!where.id_user) return {};
    return { id_user: where.id_user };
  }

  static createProductFilterSequelize(where) {
    if (!where.id_product) return {};
    return { id_product: where.id_product };
  }

  static createProducerFilterSequelize(where) {
    if (!where.id_producer) return {};
    return { '$product.id_user$': where.id_producer };
  }

  static createBaseFiltersSequelize(where) {
    let filters = {};

    if (where.start_date) {
      filters = { ...filters, ...this.createStartDateFilterSequelize(where) };
    }

    if (where.end_date) {
      filters = { ...filters, ...this.createEndDateFilterSequelize(where) };
    }

    if (where.id_status) {
      filters = { ...filters, ...this.createStatusFilterSequelize(where) };
    }

    if (where.payment_method) {
      filters = {
        ...filters,
        ...this.createPaymentMethodFilterSequelize(where),
      };
    }

    if (where.id_user) {
      filters = { ...filters, ...this.createUserFilterSequelize(where) };
    }

    if (where.id_product) {
      filters = { ...filters, ...this.createProductFilterSequelize(where) };
    }

    if (where.id_producer) {
      filters = { ...filters, ...this.createProducerFilterSequelize(where) };
    }

    return filters;
  }

  static createAllFiltersSequelize(where) {
    return this.createBaseFiltersSequelize(where);
  }
}

module.exports = MetricsFilters;
