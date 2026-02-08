import { Cost_central as CostCentral } from '../database/models/CostCentral.mjs';

export class CostCentralRepository {
  static async findByMethod(method, brand, installments) {
    const costCentral = await CostCentral.findOne({
      raw: true,
      attributes: ['psp_variable_cost', 'psp_fixed_cost'],
      where: {
        method: method.toUpperCase(),
        installments,
        brand: brand.toUpperCase(),
      },
    });
    return costCentral;
  }
}
