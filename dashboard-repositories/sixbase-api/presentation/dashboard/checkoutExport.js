const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');
const { capitalizeName } = require('../../utils/formatters');

// eslint-disable-next-line arrow-body-style
const SerializeCheckoutExportAbandoned = ({
  product,
  offer,
  email,
  full_name,
  whatsapp,
  updated_at,
  address,
  affiliate,
  id_affiliate,
}) => {
  const productName = product.dataValues.name;

  return {
    nome: capitalizeName(full_name),
    email,
    telefone: whatsapp,
    data: format(new Date(updated_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
    produto: productName || 'Sem produto',
    oferta: offer.name,
    afiliado: affiliate?.user?.full_name || 'Sem afiliado',
    cep: address && address.zipcode ? address.zipcode : 'Sem CEP preenchido',
    cidade:
      address && address.city
        ? capitalizeName(address.city)
        : 'Sem cidade preenchida',
    estado: address && address.state ? address.state : 'Sem estado preenchido',
    bairro:
      address && address.neighborhood
        ? address.neighborhood
        : 'Sem bairro preenchido',
    rua: address && address.street ? address.street : 'Sem rua preenchida',
    numero:
      address && address.number ? address.number : 'Sem número preenchido',
    complemento:
      address && address.complement
        ? address.complement
        : 'Sem complemento preenchido',
    tipo_carrinho: id_affiliate ? 'Afiliado' : 'Produtor',
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map((data) => SerializeCheckoutExportAbandoned(data));
    }
    return SerializeCheckoutExportAbandoned(this.data);
  }
};
