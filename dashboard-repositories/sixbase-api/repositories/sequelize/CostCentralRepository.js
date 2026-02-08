const CostCentral = require('../../database/models/Cost_central');

module.exports = class CostCentralRepository {
  static async find() {
    return CostCentral.findAll({});
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
