const CostCentral = require('../../database/models/Cost_central');

module.exports = class CostCentralRepository {
  static async findAll() {
    const costs = await CostCentral.findAll({ raw: true });
    return costs;
  }

  static async update(where, data) {
    await CostCentral.update(data, { where });
  }

  static async findByMethod(method) {
    const costCentral = await CostCentral.findOne({
      where: {
        method,
      },
    });

    if (costCentral) return costCentral.toJSON();
    return costCentral;
  }
};
