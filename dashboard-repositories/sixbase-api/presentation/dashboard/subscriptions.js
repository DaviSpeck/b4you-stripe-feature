const { capitalizeName } = require('../../utils/formatters');
const { findSubscriptionStatus } = require('../../status/subscriptionsStatus');

const serializeProduct = ({ uuid, name }) => ({
  uuid,
  name: capitalizeName(name),
});

const serializePlan = (plan) => {
  const { uuid, price, label } = plan;
  return {
    uuid,
    price,
    label: capitalizeName(label),
  };
};

const serializeStudent = (student) => {
  const { full_name, email } = student;
  return {
    full_name: capitalizeName(full_name),
    email,
  };
};

const resolvePaymentMethod = (payment_method) => {
  if (payment_method === 'card') return 'Cartão de crédito';
  if (payment_method === 'billet') return 'Boleto';
  if (payment_method === 'pix') return 'Pix';
  return 'Cartão de crédito';
};

const serializeSingleSubscription = (subscription) => {
  const {
    product,
    plan,
    student,
    uuid,
    next_charge,
    created_at,
    id_status,
    payment_method,
    can_reprocess,
    id,
    attempt_count,
    canceled_at,
  } = subscription;

  const isCanceled = id_status === 3 || id_status === 4;
  const isInvoluntary = isCanceled && attempt_count >= 4;
  const isVoluntary =
    isCanceled && (attempt_count === 0 || attempt_count === null);

  let cancellation_type = null;
  if (isInvoluntary) {
    cancellation_type = 'involuntary';
  } else if (isVoluntary) {
    cancellation_type = 'voluntary';
  }

  return {
    uuid,
    id,
    status: findSubscriptionStatus(id_status),
    product: serializeProduct(product),
    plan: serializePlan(plan),
    student: serializeStudent(student),
    next_charge,
    created_at,
    payment_method: payment_method || 'card',
    payment_method_label: resolvePaymentMethod(payment_method || 'card'),
    can_reprocess: can_reprocess !== undefined ? can_reprocess : false,
    attempt_count: attempt_count || 0,
    canceled_at,
    cancellation_type,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleSubscription);
    }
    return serializeSingleSubscription(this.data);
  }
};
