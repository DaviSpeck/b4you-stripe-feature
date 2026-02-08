const { Op } = require('sequelize');

class CoproductionFilters {
  static createUserFilterSQL(where) {
    if (!where.id_user) return '';
    return `AND c.id_user = :id_user`;
  }

  static createProductFilterSQL(where) {
    if (!where.id_product) return '';
    return `AND c.id_product = :id_product`;
  }

  static createStatusFilterSQL(where) {
    if (!where.status) return '';
    return `AND c.status = :status`;
  }

  static createDateFilterSQL(where) {
    if (!where.start_date || !where.end_date) return '';
    return `AND c.created_at BETWEEN :start_date AND :end_date`;
  }

  static createUserNameFilterSQL(where) {
    if (!where.user_name) return '';
    return `AND (u.first_name LIKE :user_name OR u.last_name LIKE :user_name OR CONCAT(u.first_name, ' ', u.last_name) LIKE :user_name)`;
  }

  static createProductNameFilterSQL(where) {
    if (!where.product_name) return '';
    return `AND p.name LIKE :product_name`;
  }

  static createBaseFiltersSQL(where) {
    let filters = '';
    let replacements = {};

    if (where.id_user) {
      filters += this.createUserFilterSQL(where);
      replacements.id_user = where.id_user;
    }

    if (where.id_product) {
      filters += this.createProductFilterSQL(where);
      replacements.id_product = where.id_product;
    }

    if (where.status) {
      filters += this.createStatusFilterSQL(where);
      replacements.status = where.status;
    }

    if (where.start_date && where.end_date) {
      filters += this.createDateFilterSQL(where);
      replacements.start_date = where.start_date;
      replacements.end_date = where.end_date;
    }

    if (where.user_name) {
      filters += this.createUserNameFilterSQL(where);
      replacements.user_name = `%${where.user_name}%`;
    }

    if (where.product_name) {
      filters += this.createProductNameFilterSQL(where);
      replacements.product_name = `%${where.product_name}%`;
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

  static createProductFilterSequelize(where) {
    if (!where.id_product) return {};
    return { id_product: where.id_product };
  }

  static createStatusFilterSequelize(where) {
    if (!where.status) return {};
    return { status: where.status };
  }

  static createDateFilterSequelize(where) {
    if (!where.start_date || !where.end_date) return {};
    return {
      created_at: {
        [Op.between]: [where.start_date, where.end_date],
      },
    };
  }

  static createUserNameFilterSequelize(where) {
    if (!where.user_name) return {};
    return {
      '$user.first_name$': { [Op.like]: `%${where.user_name}%` },
      '$user.last_name$': { [Op.like]: `%${where.user_name}%` },
    };
  }

  static createProductNameFilterSequelize(where) {
    if (!where.product_name) return {};
    return {
      '$product.name$': { [Op.like]: `%${where.product_name}%` },
    };
  }

  static createBaseFiltersSequelize(where) {
    let filters = {};

    if (where.id_user) {
      filters = { ...filters, ...this.createUserFilterSequelize(where) };
    }

    if (where.id_product) {
      filters = { ...filters, ...this.createProductFilterSequelize(where) };
    }

    if (where.status) {
      filters = { ...filters, ...this.createStatusFilterSequelize(where) };
    }

    if (where.start_date && where.end_date) {
      filters = { ...filters, ...this.createDateFilterSequelize(where) };
    }

    if (where.user_name) {
      filters = { ...filters, ...this.createUserNameFilterSequelize(where) };
    }

    if (where.product_name) {
      filters = { ...filters, ...this.createProductNameFilterSequelize(where) };
    }

    return filters;
  }

  static createAllFiltersSequelize(where) {
    return this.createBaseFiltersSequelize(where);
  }
}

module.exports = CoproductionFilters;
