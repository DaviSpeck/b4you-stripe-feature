import { CreditCardFees } from './CreditCardFees.mjs';

export class SalesFees {
  #CostCentralRepository;

  #SalesSettingsRepository;

  constructor(CostCentralRepository, SalesSettingsRepository) {
    this.#CostCentralRepository = CostCentralRepository;
    this.#SalesSettingsRepository = SalesSettingsRepository;
  }

  async calculate({
    id_user,
    brand,
    installments,
    student_pays_interest,
    sales_items,
    discount,
    coupon_discount = 0,
  }) {
    const pspFees = await this.#CostCentralRepository.findByMethod('CARD', brand, installments);
    const settings = await this.#SalesSettingsRepository.find(id_user);
    const taxes = { tax_variable_percentage: 6 };
    return new CreditCardFees({
      fees: pspFees,
      taxes,
      settings,
      brand,
      installments,
      student_pays_interest,
      sales_items,
      discount,
      coupon_discount,
    }).execute();
  }
}
