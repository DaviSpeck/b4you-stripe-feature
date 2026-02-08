const Taxes = require('../../database/models/Taxes');

module.exports = class TaxesRepository {
  static async find() {
    return Taxes.findOne({
      order: [['id', 'desc']],
    });
  }
};
