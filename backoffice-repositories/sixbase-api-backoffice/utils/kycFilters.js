const { Op } = require('sequelize');

class KycFilters {
  static createUserFilterSQL(where) {
    if (!where.id_user) return '';
    return `AND vi.id_user = :id_user`;
  }

  static createStatusFilterSQL(where) {
    if (!where.status) return '';
    return `AND vi.status = :status`;
  }

  static createDocumentTypeFilterSQL(where) {
    if (!where.document_type) return '';
    return `AND vi.document_type = :document_type`;
  }

  static createDateFilterSQL(where) {
    if (!where.start_date || !where.end_date) return '';
    return `AND vi.created_at BETWEEN :start_date AND :end_date`;
  }

  static createLast30DaysFilterSQL(where) {
    if (!where.last_30_days) return '';
    return `AND vi.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
  }

  static createUserNameFilterSQL(where) {
    if (!where.user_name) return '';
    return `AND (u.first_name LIKE :user_name OR u.last_name LIKE :user_name OR CONCAT(u.first_name, ' ', u.last_name) LIKE :user_name)`;
  }

  static createUserEmailFilterSQL(where) {
    if (!where.user_email) return '';
    return `AND u.email LIKE :user_email`;
  }

  static createBaseFiltersSQL(where) {
    let filters = '';
    let replacements = {};

    if (where.id_user) {
      filters += this.createUserFilterSQL(where);
      replacements.id_user = where.id_user;
    }

    if (where.status) {
      filters += this.createStatusFilterSQL(where);
      replacements.status = where.status;
    }

    if (where.document_type) {
      filters += this.createDocumentTypeFilterSQL(where);
      replacements.document_type = where.document_type;
    }

    if (where.start_date && where.end_date) {
      filters += this.createDateFilterSQL(where);
      replacements.start_date = where.start_date;
      replacements.end_date = where.end_date;
    }

    if (where.last_30_days) {
      filters += this.createLast30DaysFilterSQL(where);
    }

    if (where.user_name) {
      filters += this.createUserNameFilterSQL(where);
      replacements.user_name = `%${where.user_name}%`;
    }

    if (where.user_email) {
      filters += this.createUserEmailFilterSQL(where);
      replacements.user_email = `%${where.user_email}%`;
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

  static createStatusFilterSequelize(where) {
    if (!where.status) return {};
    return { status: where.status };
  }

  static createDocumentTypeFilterSequelize(where) {
    if (!where.document_type) return {};
    return { document_type: where.document_type };
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

  static createUserNameFilterSequelize(where) {
    if (!where.user_name) return {};
    return {
      '$user.first_name$': { [Op.like]: `%${where.user_name}%` },
      '$user.last_name$': { [Op.like]: `%${where.user_name}%` },
    };
  }

  static createUserEmailFilterSequelize(where) {
    if (!where.user_email) return {};
    return {
      '$user.email$': { [Op.like]: `%${where.user_email}%` },
    };
  }

  static createBaseFiltersSequelize(where) {
    let filters = {};

    if (where.id_user) {
      filters = { ...filters, ...this.createUserFilterSequelize(where) };
    }

    if (where.status) {
      filters = { ...filters, ...this.createStatusFilterSequelize(where) };
    }

    if (where.document_type) {
      filters = {
        ...filters,
        ...this.createDocumentTypeFilterSequelize(where),
      };
    }

    if (where.start_date && where.end_date) {
      filters = { ...filters, ...this.createDateFilterSequelize(where) };
    }

    if (where.last_30_days) {
      filters = { ...filters, ...this.createLast30DaysFilterSequelize(where) };
    }

    if (where.user_name) {
      filters = { ...filters, ...this.createUserNameFilterSequelize(where) };
    }

    if (where.user_email) {
      filters = { ...filters, ...this.createUserEmailFilterSequelize(where) };
    }

    return filters;
  }

  static createAllFiltersSequelize(where) {
    return this.createBaseFiltersSequelize(where);
  }
}

module.exports = KycFilters;
