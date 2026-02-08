const BilletFees = require('../fees/BilletFees');
const CreditCardFees = require('../fees/CreditCardFees');
const PixFees = require('../fees/PixFees');
const { validateCouponOffers } = require('./validateCouponOffers');

/**
 * Calculates fees and costs for sales based on payment method
 * Handles fee calculation for credit card, PIX, and billet payment methods
 * @class SalesFees
 */
module.exports = class SalesFees {
  #CostCentralRepository;

  #SalesSettingsRepository;

  #TaxesRepository;

  /**
   * Creates an instance of SalesFees
   * @param {Object} CostCentralRepository - Repository for cost central data
   * @param {Object} SalesSettingsRepository - Repository for sales settings
   * @param {Object} TaxesRepository - Repository for tax data
   */
  constructor(CostCentralRepository, SalesSettingsRepository, TaxesRepository) {
    this.#CostCentralRepository = CostCentralRepository;
    this.#SalesSettingsRepository = SalesSettingsRepository;
    this.#TaxesRepository = TaxesRepository;
  }

  /**
   * Calculates fees and costs for a sale
   * @param {Object} params - Calculation parameters
   * @param {number} params.id_user - User ID for settings lookup
   * @param {string} [params.brand] - Card brand (for credit card payments)
   * @param {number} [params.installments] - Number of installments
   * @param {boolean} params.student_pays_interest - Whether student pays interest
   * @param {Array<Object>} params.sales_items - Array of sale items with prices
   * @param {number} [params.discount=0] - Discount amount
   * @param {string} params.payment_method - Payment method ('card', 'pix', or 'billet')
   * @param {Object|null} [params.coupon] - Coupon object if applicable
   * @param {string} params.document_number - Customer document number (CPF/CNPJ)
   * @returns {Promise<Array<Object>>} Array of transaction objects with calculated fees
   * @throws {Error} If payment method is not defined
   */
  async calculate({
    id_user,
    brand,
    installments,
    student_pays_interest,
    sales_items,
    discount,
    payment_method,
    coupon,
    document_number,
  }) {
    if (!payment_method) throw new Error('payment method is not defined');

    const { coupon: couponWithRestrictions } = validateCouponOffers(
      coupon,
      sales_items,
    );

    const pspFees = await this.#CostCentralRepository.find();
    const settings = await this.#SalesSettingsRepository.find(id_user);
    const taxes = await this.#TaxesRepository.find();
    if (payment_method === 'card') {
      return new CreditCardFees({
        fees: pspFees,
        taxes,
        settings,
        brand,
        installments,
        student_pays_interest,
        sales_items,
        discount,
        coupon: couponWithRestrictions,
        document_number,
      }).execute();
    }

    if (payment_method === 'pix') {
      return new PixFees({
        fees: pspFees,
        settings,
        taxes,
        student_pays_interest,
        sales_items,
        discount,
        coupon: couponWithRestrictions,
        document_number,
      }).execute();
    }

    return new BilletFees({
      fees: pspFees,
      taxes,
      settings,
      student_pays_interest,
      sales_items,
      discount,
      coupon: couponWithRestrictions,
      document_number,
    }).execute();
  }
};
