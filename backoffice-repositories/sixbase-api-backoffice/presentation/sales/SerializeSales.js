const { findStatus } = require('../../status/salesStatus');
const { capitalizeName } = require('../../utils/formatters');
const { findSaleItemsType } = require('../../types/saleItemsTypes');
const { findRoleType } = require('../../types/roles');

const paymentMethods = {
  pix: 'Pix',
  card: 'Cartão de crédito',
  billet: 'Boleto',
};

const resolveProducts = ({ uuid, name }) => ({
  uuid,
  name,
});

const resolveStudent = (student) => {
  const { uuid, full_name, profile_picture, email } = student;
  return {
    uuid,
    full_name: capitalizeName(full_name),
    email,
    profile_picture,
  };
};
const serializeSingleSaleitem = (sale_item) => {
  const {
    product,
    student,
    created_at,
    uuid,
    id_status,
    price,
    type,
    payment_method,
    transactions,
    affiliate,
  } = sale_item;

  const { producer } = product;

  const commission = transactions.find((t) => t.id_user === producer.id);
  return {
    uuid,
    status: findStatus(id_status),
    price,
    commission_amount: commission?.user_net_amount,
    payment_method: paymentMethods[payment_method],
    type: findSaleItemsType(type),
    product: resolveProducts(product),
    student: resolveStudent(student),
    created_at,
    role: findRoleType(commission?.id_role || 1),
    has_affliate: !!affiliate,
  };
};

module.exports = class SerializeSales {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleSaleitem);
    }
    return serializeSingleSaleitem(this.data);
  }
};
