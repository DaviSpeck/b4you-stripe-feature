const Fees = require('../../checkout/fees/Fees');

module.exports = class calculateWithdrawalFeesAndAmounts {
  #TaxesRepository;

  #CostCentralRepository;

  constructor(TaxesRepository, CostCentralRepository) {
    this.#TaxesRepository = TaxesRepository;
    this.#CostCentralRepository = CostCentralRepository;
  }

  async execute({ amount, withdrawalSettings, method }) {
    const taxes = await this.#TaxesRepository.find();
    if (!taxes) throw new Error('Taxes not found');
    const costCentral = await this.#CostCentralRepository.findByMethod(
      `WITHDRAWAL_${method}`,
    );
    if (!costCentral) throw new Error('Withdrawal method not found');
    const { psp_variable_cost, psp_fixed_cost } = costCentral;
    const { tax_variable_percentage } = taxes;
    const { fee_fixed, fee_variable } = withdrawalSettings;
    const fees = Fees.withdrawal({
      amount,
      fee_fixed_method: fee_fixed,
      fee_variable_method: fee_variable,
      psp_cost_fixed_amount: psp_fixed_cost,
      psp_cost_variable_percentage: psp_variable_cost,
      tax_variable_percentage,
    });

    return fees;
  }
};
