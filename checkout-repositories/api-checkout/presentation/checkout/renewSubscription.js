const { findFrequency } = require('../../types/frequencyTypes');
const CalculateInstallments = require('../../useCases/checkout/installments/CalculateInstallments');
const { capitalizeName } = require('../../utils/formatters');
const { resolveType } = require('../common');

const serializePlan = (
  { uuid, price, label, frequency_label },
  { max_installments, student_pays_interest },
) => ({
  uuid,
  price,
  label,
  frequency_label: findFrequency(capitalizeName(frequency_label)).translate,
  installments_list: new CalculateInstallments({
    settings: {
      fee_interest_card: {
        student_fees: [{ brand: 'master', monthly_installment_interest: 3.49 }],
      },
    },
    installments: max_installments,
    student_pays_interest,
    price,
  }).execute(),
});

const serializeSingleProduct = (product) => {
  const {
    name,
    description,
    payment_frequency,
    content_delivery,
    cover,
    warranty,
    sales_page_url,
    support_email,
    support_whatsapp,
    logo,
    id_type,
    excerpt,
  } = product;
  return {
    name,
    description,
    excerpt,
    type: resolveType(id_type),
    payment_frequency,
    content_delivery,
    cover,
    warranty,
    sales_page_url,
    support_email,
    support_whatsapp,
    logo,
  };
};

const serializeRenewSubscription = (subscription) => {
  const { uuid, product, plan, next_charge } = subscription;

  return {
    uuid,
    product: serializeSingleProduct(product),
    plan: serializePlan(plan, subscription),
    next_charge,
    payment_methods: ['card', 'pix'],
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeRenewSubscription);
    }
    return serializeRenewSubscription(this.data);
  }
};
