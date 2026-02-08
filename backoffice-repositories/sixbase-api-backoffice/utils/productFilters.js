const { Op } = require('sequelize');

class ProductFilters {
  static createSearchFilterSQL(where) {
    if (!where.input || where.input.trim() === '') return '';

    const trimmedInput = where.input.trim();
    return `AND (LOWER(p.name) LIKE LOWER(:input) OR LOWER(p.description) LIKE LOWER(:input))`;
  }

  static createProducerFilterSQL(where) {
    if (!where.producerUuid) return '';
    return `AND u.uuid = :producerUuid`;
  }

  static createStatusFilterSQL(where) {
    if (!where.status) return '';
    return `AND p.status = :status`;
  }

  static createDateFilterSQL(where) {
    if (!where.start_date || !where.end_date) return '';
    return `AND p.created_at BETWEEN :start_date AND :end_date`;
  }

  static createBaseFiltersSQL(where) {
    let filters = '';
    let replacements = {};

    if (where.input && where.input.trim() !== '') {
      filters += this.createSearchFilterSQL(where);
      replacements.input = `%${where.input}%`;
    }

    if (where.producerUuid) {
      filters += this.createProducerFilterSQL(where);
      replacements.producerUuid = where.producerUuid;
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

    return { filters, replacements };
  }

  static createAllFiltersSQL(where) {
    return this.createBaseFiltersSQL(where);
  }

  // ========== SEQUELIZE FILTERS ==========

  static createSearchFilterSequelize(where) {
    if (!where.input) return {};

    const trimmedInput = where.input.trim();
    return {
      [Op.or]: [
        { name: { [Op.like]: `%${trimmedInput}%` } },
        { description: { [Op.like]: `%${trimmedInput}%` } },
      ],
    };
  }

  static createProducerFilterSequelize(where) {
    if (!where.producerUuid) return {};
    return {
      '$producer.uuid$': where.producerUuid,
    };
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

  static createBaseFiltersSequelize(where) {
    let filters = {};

    if (where.input) {
      filters = { ...filters, ...this.createSearchFilterSequelize(where) };
    }

    if (where.producerUuid) {
      filters = { ...filters, ...this.createProducerFilterSequelize(where) };
    }

    if (where.status) {
      filters = { ...filters, ...this.createStatusFilterSequelize(where) };
    }

    if (where.start_date && where.end_date) {
      filters = { ...filters, ...this.createDateFilterSequelize(where) };
    }

    return filters;
  }

  static createAllFiltersSequelize(where) {
    return this.createBaseFiltersSequelize(where);
  }
}

module.exports = ProductFilters;
