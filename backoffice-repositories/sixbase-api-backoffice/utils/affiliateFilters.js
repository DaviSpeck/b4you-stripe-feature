const { Op } = require('sequelize');

class AffiliateFilters {
  static createSearchFilterSQL(where) {
    if (!where.input || where.input.trim() === '') return '';

    const trimmedInput = where.input.trim();
    if (!trimmedInput.includes(' ')) {
      return `AND (
        LOWER(u.first_name) LIKE LOWER(:input) OR 
        LOWER(u.last_name) LIKE LOWER(:input) OR 
        LOWER(u.email) LIKE LOWER(:input)
      )`;
    } else {
      const [firstName, ...lastName] = trimmedInput.split(' ');
      return `AND (
        LOWER(u.first_name) LIKE LOWER(:firstName) OR 
        LOWER(u.last_name) LIKE LOWER(:lastName)
      )`;
    }
  }

  static createProductFilterSQL(where) {
    if (!where.productUuid) return '';
    return `AND p.uuid = :productUuid`;
  }

  static createUserFilterSQL(where) {
    if (!where.id_user) return '';
    return `AND a.id_user = :id_user`;
  }

  static createBaseFiltersSQL(where) {
    let filters = '';
    let replacements = {};

    if (where.input && where.input.trim() !== '') {
      filters += this.createSearchFilterSQL(where);
      const trimmedInput = where.input.trim();
      if (!trimmedInput.includes(' ')) {
        replacements.input = `%${trimmedInput}%`;
      } else {
        const [firstName, ...lastName] = trimmedInput.split(' ');
        replacements.firstName = `%${firstName}%`;
        replacements.lastName = `%${lastName.join(' ')}%`;
      }
    }

    if (where.productUuid) {
      filters += this.createProductFilterSQL(where);
      replacements.productUuid = where.productUuid;
    }

    if (where.id_user) {
      filters += this.createUserFilterSQL(where);
      replacements.id_user = where.id_user;
    }

    return { filters, replacements };
  }

  static createProductAffiliatesFiltersSQL(where) {
    return this.createBaseFiltersSQL(where);
  }

  static createUserAffiliatesFiltersSQL(where) {
    return this.createBaseFiltersSQL(where);
  }

  // ========== SEQUELIZE FILTERS ==========

  static createSearchFilterSequelize(where) {
    if (!where.input) return {};

    const trimmedInput = where.input.trim();
    if (!trimmedInput.includes(' ')) {
      return {
        [Op.or]: {
          '$user.first_name$': { [Op.like]: `%${trimmedInput}%` },
          '$user.last_name$': { [Op.like]: `%${trimmedInput}%` },
          '$user.email$': { [Op.like]: `%${trimmedInput}%` },
        },
      };
    } else {
      const [firstName, ...lastName] = trimmedInput.split(' ');
      return {
        [Op.or]: {
          '$user.first_name$': { [Op.like]: `%${firstName}%` },
          '$user.last_name$': { [Op.like]: `%${lastName.join(' ')}%` },
        },
      };
    }
  }

  static createProductFilterSequelize(where) {
    if (!where.productUuid) return {};
    return {
      '$product.uuid$': where.productUuid,
    };
  }

  static createUserFilterSequelize(where) {
    if (!where.id_user) return {};
    return { id_user: where.id_user };
  }

  static createBaseFiltersSequelize(where) {
    let filters = {};

    if (where.input) {
      filters = { ...filters, ...this.createSearchFilterSequelize(where) };
    }

    if (where.productUuid) {
      filters = { ...filters, ...this.createProductFilterSequelize(where) };
    }

    if (where.id_user) {
      filters = { ...filters, ...this.createUserFilterSequelize(where) };
    }

    return filters;
  }

  static createProductAffiliatesFiltersSequelize(where) {
    return this.createBaseFiltersSequelize(where);
  }

  static createUserAffiliatesFiltersSequelize(where) {
    return this.createBaseFiltersSequelize(where);
  }
}

module.exports = AffiliateFilters;
