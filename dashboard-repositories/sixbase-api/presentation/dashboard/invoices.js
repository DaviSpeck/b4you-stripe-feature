const { capitalizeName, formatDocument } = require('../../utils/formatters');
const { findInvoiceType } = require('../../types/invoiceTypes');
const { findIntegrationType } = require('../../types/integrationTypes');

const serializeProduct = (product) => {
  const { uuid, name } = product;
  return {
    uuid,
    name,
  };
};

const serializeReceiver = (student, producer) => {
  if (producer)
    return {
      full_name: capitalizeName(producer.full_name),
      document: formatDocument(producer.document_number),
      role: 'producer',
    };

  return {
    full_name: capitalizeName(student.full_name),
    document: formatDocument(student.document_number),
    email: student.email,
    role: 'student',
  };
};

const serializeSingleInvoice = (invoice) => {
  const {
    uuid,
    transaction: { sales_items, price_product },
    id_type,
    id_plugin,
    created_at,
    receiver,
  } = invoice;
  const { student, product } = sales_items[0];
  return {
    uuid,
    price: price_product,
    type: findInvoiceType(id_type),
    plugin: id_plugin ? findIntegrationType(id_plugin) : null,
    receiver: serializeReceiver(student, receiver),
    product: serializeProduct(product),
    created_at,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleInvoice);
    }
    return serializeSingleInvoice(this.data);
  }
};
