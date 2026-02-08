const { findFrequency } = require('../../types/frequencyTypes');
const CalculateInstallments = require('../../useCases/checkout/installments/CalculateInstallments');
const { capitalizeName } = require('../../utils/formatters');

const resolvePaymentMethods = (payment_methods) => {
  const methods = [];
  if (payment_methods.includes('credit_card')) {
    methods.push('card');
  }

  if (payment_methods.includes('pix')) {
    methods.push('pix');
  }

  return methods;
};

const resolveCreditCard = ({
  student,
  settings,
  installments,
  student_pays_interest,
  price,
  selectedPlan,
}) => {
  const { credit_card } = student;

  return {
    brand: credit_card?.brand,
    last_four_digits: credit_card?.last_four_digits,
    installments_list: !selectedPlan
      ? new CalculateInstallments({
        settings,
        installments,
        student_pays_interest,
        price,
      }).execute()
      : null,
  };
};

const resolvePlan = (plan) => {
  if (!plan) return null;
  const {
    uuid,
    price,
    label,
    frequency_label,
    subscription_fee,
    subscription_fee_price,
    charge_first,
  } = plan;

  return {
    uuid,
    price,
    label,
    frequency_label: findFrequency(capitalizeName(frequency_label)).translate,
    subscription_fee,
    subscription_fee_price,
    charge_first,
  };
};

const serializeOfferInfo = (productOffer) => {
  const {
    uuid,
    price,
    settings,
    saleItem,
    payment_methods,
    installments,
    student_pays_interest,
    plan_id,
    plans,
  } = productOffer;

  const allowed_payment_methods = resolvePaymentMethods(payment_methods);
  let selectedPlan = null;

  if (plan_id) {
    selectedPlan = plans.find((p) => p.uuid === plan_id);
  }
  return {
    uuid,
    price: selectedPlan ? selectedPlan.price : price,
    last_payment_method: saleItem.payment_method,
    allowed_payment_methods,
    plan: resolvePlan(selectedPlan),
    card: allowed_payment_methods.includes('card')
      ? resolveCreditCard({
        installments,
        price,
        settings,
        student: saleItem.student,
        student_pays_interest,
        selectedPlan,
      })
      : null,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeOfferInfo);
    }
    return serializeOfferInfo(this.data);
  }
};
