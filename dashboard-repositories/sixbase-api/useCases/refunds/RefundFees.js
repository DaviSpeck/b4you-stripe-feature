const Fees = require('../checkout/fees/Fees');

module.exports = class RefundFees {
  #TaxesRepository;

  #CostCentralRepository;

  constructor(TaxesRepository, CostCentralRepository) {
    this.#TaxesRepository = TaxesRepository;
    this.#CostCentralRepository = CostCentralRepository;
  }

  async execute({ amount, refundSettings, method }) {
    const taxes = await this.#TaxesRepository.find();
    if (!taxes) throw new Error('Taxes not found');
    const costs = await this.#CostCentralRepository.findByMethod(
      `REFUND_${method}`,
    );
    if (!costs) throw new Error('Refund method not found');
    const { psp_variable_cost, psp_fixed_cost } = costs;
    const fee_fixed =
      refundSettings[`fee_fixed_refund_${method.toLowerCase()}`];
    const { tax_variable_percentage } = taxes;
    const fees = Fees.refund({
      amount,
      fee_fixed_method: fee_fixed,
      fee_variable_method: 0,
      psp_cost_fixed_amount: psp_fixed_cost,
      psp_cost_variable_percentage: psp_variable_cost,
      tax_variable_percentage,
    });

    return fees;
  }
};
