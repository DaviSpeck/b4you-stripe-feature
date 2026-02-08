const ExportToExcel = require('../../../utils/helpers/excel');
const dateHelper = require('../../../utils/helpers/date');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../../types/dateTypes');
const { findUserByID } = require('../../../database/controllers/users');
const {
  capitalizeName,
  formatDocument,
  formatBRL,
} = require('../../../utils/formatters');

const getHeaders = () => [
  {
    key: 'ID',
    width: 0,
  },
  {
    key: 'DATA',
    width: 0,
  },
  {
    key: 'NOME',
    width: 0,
  },
  {
    key: 'E-MAIL',
    width: 0,
  },
  {
    key: 'DOCUMENTO',
    width: 0,
  },
  {
    key: 'VALOR',
    width: 0,
  },
  {
    key: 'DESCRIÇÃO',
    width: 0,
  },
  {
    key: 'ESTADO',
    width: 0,
  },
  {
    key: 'CIDADE',
    width: 0,
  },
  {
    key: 'BAIRRO',
    width: 0,
  },
  {
    key: 'RUA',
    width: 0,
  },
  {
    key: 'NÚMERO',
    width: 0,
  },
  {
    key: 'CEP',
    width: 0,
  },
];

const dataToExport = (invoices, producer) => {
  if (invoices.length === 0) return [];
  return invoices.map(
    ({
      uuid,
      created_at,
      receiver,
      transaction: { price_product, sales_items },
    }) => {
      const { student, product } = sales_items[0];
      if (receiver) {
        return [
          uuid,
          dateHelper(created_at).format(FRONTEND_DATE_WITHOUT_TIME),
          capitalizeName(receiver.full_name),
          receiver.email,
          formatDocument(receiver.document_number),
          formatBRL(price_product),
          'Nota de afiliado para produtor',
          capitalizeName(producer.state),
          capitalizeName(producer.city),
          capitalizeName(producer.neighborhood),
          capitalizeName(producer.street),
          producer.number,
          producer.zipcode,
        ];
      }
      return [
        uuid,
        dateHelper(created_at).format(FRONTEND_DATE_WITHOUT_TIME),
        capitalizeName(student.full_name),
        student.email,
        formatDocument(student.document_number),
        formatBRL(price_product),
        capitalizeName(product.name),
        capitalizeName(producer.state),
        capitalizeName(producer.city),
        capitalizeName(producer.neighborhood),
        capitalizeName(producer.street),
        producer.number,
        producer.zipcode,
      ];
    },
  );
};

module.exports = class ExportXLS {
  constructor(id_user, invoices) {
    this.id_user = id_user;
    this.invoices = invoices;
  }

  async execute() {
    const user = await findUserByID(this.id_user);
    const headers = getHeaders();
    const data = dataToExport(this.invoices, user);
    const file = await new ExportToExcel('B4you', headers, data).execute();
    return file;
  }
};
