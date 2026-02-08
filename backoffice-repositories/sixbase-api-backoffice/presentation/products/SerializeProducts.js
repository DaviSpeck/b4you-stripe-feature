const { findPaymentTypeByKey } = require('../../types/paymentTypes');
const { findProductFormat } = require('../../types/productFormat');
const serializeProducts = ({
  uuid,
  payment_type,
  support_email,
  support_whatsapp,
  id_type,
  warranty,
  name,
  producer_name,
  producer_uuid,
  producer,
}) => {
  const full_name = producer?.full_name || producer_name;
  const uuid_producer = producer?.uuid || producer_uuid;
  return {
    uuid,
    name,
    payment_type: payment_type
      ? findPaymentTypeByKey(payment_type).label
      : 'Não informado',
    support_email,
    support_whatsapp,
    type: id_type ? findProductFormat(id_type).label : 'Não informado',
    warranty,
    producer: {
      full_name: full_name || 'Produtor não encontrado',
      uuid: uuid_producer,
    },
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeProducts);
    }
    return serializeProducts(this.data);
  }
};
