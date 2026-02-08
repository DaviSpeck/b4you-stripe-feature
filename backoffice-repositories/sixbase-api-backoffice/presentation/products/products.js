const {
  VIDEOTYPE,
  EBOOKTYPE,
  PAYMENT_ONLY_TYPE,
  SUBSCRIPTION,
  PHYSICAL_TYPE
} = require('../../types/productTypes');
const { capitalizeName } = require('../../utils/formatters');

const getTypeName = (id_type) => {
  switch (id_type) {
    case VIDEOTYPE:
      return 'Vídeo';
    case EBOOKTYPE:
      return 'E-book';
    case PAYMENT_ONLY_TYPE:
      return 'Somente Pagamento';
    case SUBSCRIPTION:
      return 'Assinatura';
    case PHYSICAL_TYPE:
      return 'Produto Físico';
    default:
      return 'Desconhecido';
  }
};

const serializeProducts = ({
  uuid,
  name,
  payment_type,
  warranty,
  id_type,
  deleted_at,
}) => ({
  uuid,
  name: capitalizeName(name),
  payment_type,
  warranty_days: warranty,
  type: getTypeName(id_type),
  deleted: !deleted_at,
  deleted_at,
});

module.exports = class SerializeProducts {
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
