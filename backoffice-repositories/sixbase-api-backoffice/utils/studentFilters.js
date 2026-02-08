const { Op } = require('sequelize');

class StudentFilters {
  /**
   * @param {Object} 
   * @returns {string} 
   */
  static createDateFilterSQL(where) {
    if (where.start_date && where.end_date) {
      return 'AND s.created_at BETWEEN :start_date AND :end_date';
    }
    return '';
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createDateFilterSequelize(where) {
    const filters = {};

    if (where.start_date && where.end_date) {
      filters.created_at = {
        [Op.between]: [where.start_date, where.end_date],
      };
    }

    return filters;
  }

  /**
   * @param {Object} 
   * @returns {string} 
   */
  static createStatusFilterSQL(where) {
    if (where.status && Array.isArray(where.status)) {
      return 'AND s.status IN (:status)';
    } else if (where.status) {
      return 'AND s.status = :status';
    }
    return '';
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createStatusFilterSequelize(where) {
    const filters = {};

    if (where.status) {
      if (Array.isArray(where.status)) {
        filters.status = { [Op.in]: where.status };
      } else {
        filters.status = where.status;
      }
    }

    return filters;
  }

  /**
   * @param {Object} 
   * @returns {string} 
   */
  static createSearchFilterSQL(where) {
    if (!where.input) return '';

    const trimmedInput = where.input.trim();
    let searchConditions = [];

    if (!trimmedInput.includes(' ')) {
      searchConditions.push(
        '(s.full_name LIKE :search_input OR s.email LIKE :search_input)',
      );
    } else {
      searchConditions.push('s.full_name LIKE :search_input');
    }

    const sanitizedInput = where.input.replace(/[^\d]/g, '');
    if (sanitizedInput.length > 0 && !/[a-zA-Z]/gm.test(trimmedInput)) {
      searchConditions.push('s.document_number LIKE :search_document');
    }

    return searchConditions.length > 0
      ? `AND (${searchConditions.join(' OR ')})`
      : '';
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createSearchFilterSequelize(where) {
    if (!where.input) return {};

    const trimmedInput = where.input.trim();
    let orObject = {};

    if (!trimmedInput.includes(' ')) {
      orObject = {
        full_name: { [Op.like]: `%${trimmedInput}%` },
        email: { [Op.like]: `%${trimmedInput}%` },
      };
    } else {
      orObject = {
        full_name: { [Op.like]: `%${trimmedInput}%` },
      };
    }

    const sanitizedInput = where.input.replace(/[^\d]/g, '');
    if (sanitizedInput.length > 0 && !/[a-zA-Z]/gm.test(trimmedInput)) {
      orObject = {
        ...orObject,
        document_number: { [Op.like]: `%${sanitizedInput}%` },
      };
    }

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
    }

    const statusFilter = this.createStatusFilterSQL(where);
    if (statusFilter) {
      baseFilters.push(statusFilter);
    }

    const searchFilter = this.createSearchFilterSQL(where);
    if (searchFilter) {
      baseFilters.push(searchFilter);
      if (where.input && where.input.trim() !== '') {
        baseReplacements.search_input = `%${where.input.trim()}%`;
        const sanitizedInput = where.input.replace(/[^\d]/g, '');
        if (sanitizedInput.length > 0) {
          baseReplacements.search_document = `%${sanitizedInput}%`;
        }
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
    const studentWhere = {};

    Object.assign(studentWhere, this.createDateFilterSequelize(where));
    Object.assign(studentWhere, this.createStatusFilterSequelize(where));
    Object.assign(studentWhere, this.createSearchFilterSequelize(where));

    return studentWhere;
  }

  /**
   * @param {Object} 
   * @returns {Object} 
   */
  static createSalesItemsFiltersSQL(where) {
    const salesFilters = [];
    const salesReplacements = {};

    if (where.student_id) {
      salesFilters.push('AND si.id_student = :student_id');
      salesReplacements.student_id = where.student_id;
    }

    if (where.sales_status && Array.isArray(where.sales_status)) {
      salesFilters.push('AND si.id_status IN (:sales_status)');
      salesReplacements.sales_status = where.sales_status;
    } else if (where.sales_status) {
      salesFilters.push('AND si.id_status = :sales_status');
      salesReplacements.sales_status = where.sales_status;
    }

    if (where.payment_method) {
      salesFilters.push('AND si.payment_method = :payment_method');
      salesReplacements.payment_method = where.payment_method;
    }

    if (where.start_date && where.end_date) {
      salesFilters.push('AND si.created_at BETWEEN :start_date AND :end_date');
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
  static createSalesItemsFiltersSequelize(where) {
    const salesItemsWhere = {};

    if (where.student_id) {
      salesItemsWhere.id_student = where.student_id;
    }

    if (where.sales_status) {
      if (Array.isArray(where.sales_status)) {
        salesItemsWhere.id_status = { [Op.in]: where.sales_status };
      } else {
        salesItemsWhere.id_status = where.sales_status;
      }
    }

    if (where.payment_method) {
      salesItemsWhere.payment_method = where.payment_method;
    }

    if (where.start_date && where.end_date) {
      salesItemsWhere.created_at = {
        [Op.between]: [where.start_date, where.end_date],
      };
    }

    return salesItemsWhere;
  }

  /**
   * @param {Object} 
   * @param {Object}  
   * @returns {Object} 
   */
  static createAllFiltersSQL(where, salesWhere = {}) {
    const { baseFilters, baseReplacements } = this.createBaseFiltersSQL(where);
    const { salesFilters, salesReplacements } =
      this.createSalesItemsFiltersSQL(salesWhere);

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
    const studentWhere = this.createBaseFiltersSequelize(where);
    const salesItemsWhere = this.createSalesItemsFiltersSequelize(salesWhere);

    return { studentWhere, salesItemsWhere };
  }
}

module.exports = StudentFilters;
