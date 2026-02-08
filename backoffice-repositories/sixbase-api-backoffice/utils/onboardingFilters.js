const { Op } = require('sequelize');
const { formatDate } = require('./helpers/date-tz');

class OnboardingFilters {
  /**
   * Cria filtro SQL para busca por nome/email/documento do usuário
   */
  static createSearchFilterSQL(where) {
    if (!where.input || where.input.trim() === '') return '';

    const trimmedInput = where.input.trim();
    return ` AND (
      LOWER(u.full_name) LIKE LOWER(:input) OR 
      LOWER(u.email) LIKE LOWER(:input) OR 
      u.document_number LIKE :input
    )`;
  }

  /**
   * Cria filtro SQL para has_sold
   */
  static createHasSoldFilterSQL(where) {
    if (!where.has_sold) return '';
    return ` AND o.has_sold = :has_sold`;
  }

  /**
   * Cria filtro SQL para revenue
   */
  static createRevenueFilterSQL(where) {
    if (!where.revenue) return '';
    return ` AND o.revenue = :revenue`;
  }

  /**
   * Cria filtro SQL para signup_reason
   */
  static createSignupReasonFilterSQL(where) {
    if (!where.signup_reason) return '';
    return ` AND o.signup_reason = :signup_reason`;
  }

  /**
   * Cria filtro SQL para user_type
   */
  static createUserTypeFilterSQL(where) {
    if (!where.user_type) return '';
    return ` AND o.user_type = :user_type`;
  }

  /**
   * Cria filtro SQL para data de criação
   */
  static createDateFilterSQL(where) {
    if (!where.start_date || !where.end_date) return '';
    return ` AND o.created_at BETWEEN :start_date AND :end_date`;
  }

  /**
   * Cria filtros base SQL
   */
  static createBaseFiltersSQL(where) {
    let filters = '';
    let replacements = {};

    if (where.input && where.input.trim() !== '') {
      filters += this.createSearchFilterSQL(where);
      replacements.input = `%${where.input}%`;
    }

    if (where.has_sold) {
      filters += this.createHasSoldFilterSQL(where);
      replacements.has_sold = parseInt(where.has_sold, 10);
    }

    if (where.revenue) {
      filters += this.createRevenueFilterSQL(where);
      replacements.revenue = parseInt(where.revenue, 10);
    }

    if (where.signup_reason) {
      filters += this.createSignupReasonFilterSQL(where);
      replacements.signup_reason = parseInt(where.signup_reason, 10);
    }

    if (where.user_type) {
      filters += this.createUserTypeFilterSQL(where);
      replacements.user_type = where.user_type;
    }

    if (where.start_date && where.end_date) {
      filters += this.createDateFilterSQL(where);
      replacements.start_date = formatDate(where.start_date, false);
      replacements.end_date = formatDate(where.end_date, true);
    }

    return { filters, replacements };
  }

  /**
   * Cria todos os filtros SQL para onboarding
   */
  static createAllFiltersSQL(where) {
    return this.createBaseFiltersSQL(where);
  }

  // ========== SEQUELIZE FILTERS ==========

  /**
   * Cria filtro Sequelize para busca por nome/email/documento
   */
  static createSearchFilterSequelize(where) {
    if (!where.input) return {};

    const trimmedInput = where.input.trim();
    const sanitizedInput = where.input.replace(/[^\d]/g, '');

    let orObject = {
      '$user.full_name$': { [Op.like]: `%${trimmedInput}%` },
      '$user.email$': { [Op.like]: `%${trimmedInput}%` },
    };

    if (sanitizedInput.length > 0 && !/[a-zA-Z]/gm.test(trimmedInput)) {
      // Buscar por documento do usuário (campo do include)
      orObject['$user.document_number$'] = { [Op.like]: `%${sanitizedInput}%` };
    }

    return { [Op.or]: orObject };
  }

  /**
   * Cria filtro Sequelize para has_sold
   */
  static createHasSoldFilterSequelize(where) {
    if (!where.has_sold) return {};
    return { has_sold: parseInt(where.has_sold, 10) };
  }

  /**
   * Cria filtro Sequelize para revenue
   */
  static createRevenueFilterSequelize(where) {
    if (!where.revenue) return {};
    return { revenue: parseInt(where.revenue, 10) };
  }

  /**
   * Cria filtro Sequelize para signup_reason
   */
  static createSignupReasonFilterSequelize(where) {
    if (!where.signup_reason) return {};
    return { signup_reason: parseInt(where.signup_reason, 10) };
  }

  /**
   * Cria filtro Sequelize para user_type
   */
  static createUserTypeFilterSequelize(where) {
    if (!where.user_type) return {};
    return { user_type: where.user_type };
  }

  /**
   * Cria filtro Sequelize para data
   */
  static createDateFilterSequelize(where) {
    if (!where.start_date || !where.end_date) return {};
    return {
      created_at: {
        [Op.between]: [where.start_date, where.end_date],
      },
    };
  }

  /**
   * Cria filtros base Sequelize
   */
  static createBaseFiltersSequelize(where) {
    let filters = {};

    if (where.input && where.input.trim() !== '') {
      filters = { ...filters, ...this.createSearchFilterSequelize(where) };
    }

    if (where.has_sold) {
      filters = { ...filters, ...this.createHasSoldFilterSequelize(where) };
    }

    if (where.revenue) {
      filters = { ...filters, ...this.createRevenueFilterSequelize(where) };
    }

    if (where.signup_reason) {
      filters = {
        ...filters,
        ...this.createSignupReasonFilterSequelize(where),
      };
    }

    if (where.user_type) {
      filters = { ...filters, ...this.createUserTypeFilterSequelize(where) };
    }

    if (where.start_date && where.end_date) {
      const normalizedWhere = {
        ...where,
        start_date: formatDate(where.start_date, false),
        end_date: formatDate(where.end_date, true),
      };
      filters = {
        ...filters,
        ...this.createDateFilterSequelize(normalizedWhere),
      };
    }

    return filters;
  }

  /**
   * Cria todos os filtros Sequelize para onboarding
   */
  static createAllFiltersSequelize(where) {
    return this.createBaseFiltersSequelize(where);
  }
}

module.exports = OnboardingFilters;
