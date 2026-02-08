import { Cost_central } from '../models/Cost_central.mjs';

export class CostCentralRepository {
  static async find() {
    return Cost_central.findAll({});
  }

  static async findByMethod(method) {
    const costCentral = await Cost_central.findOne({
      where: {
        method,
      },
    });

    if (costCentral) return costCentral.toJSON();
    return costCentral;
  }
}
