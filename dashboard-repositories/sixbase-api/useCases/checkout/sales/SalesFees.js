const BilletFees = require('../fees/BilletFees');
const CreditCardFees = require('../fees/CreditCardFees');
const PixFees = require('../fees/PixFees');

module.exports = class SalesFees {
  #CostCentralRepository;

  #SalesSettingsRepository;

  #TaxesRepository;

  constructor(CostCentralRepository, SalesSettingsRepository, TaxesRepository) {
    this.#CostCentralRepository = CostCentralRepository;
    this.#SalesSettingsRepository = SalesSettingsRepository;
    this.#TaxesRepository = TaxesRepository;
  }

  async calculate({
    id_user,
    brand,
    installments,
    student_pays_interest,
    sales_items,
    discount,
    payment_method,
    coupon_discount = 0,
  }) {
    if (!payment_method) throw new Error('payment method is not defined');
    const pspFees = await this.#CostCentralRepository.find();
    const settings = await this.#SalesSettingsRepository.find(id_user);
    const taxes = await this.#TaxesRepository.find();
    let fees;
    if (payment_method === 'card') {
      fees = new CreditCardFees({
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

    if (payment_method === 'pix') {
      fees = new PixFees({
        fees: pspFees,
        settings,
        taxes,
        student_pays_interest,
        sales_items,
        discount,
        coupon_discount,
      }).execute();
    }

    if (payment_method === 'billet') {
      fees = new BilletFees({
        fees: pspFees,
        taxes,
        settings,
        student_pays_interest,
        sales_items,
        discount,
        coupon_discount,
      }).execute();
    }

    return fees;
  }
};
