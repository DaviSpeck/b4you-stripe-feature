const ApiError = require('../../../error/ApiError');
const GenerateReceiptPDF = require('../MasterPDF/GenerateReceiptPDF');
const dateHelper = require('../../../utils/helpers/date');
const { findOneInvoice } = require('../../../database/controllers/invoices');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../../types/dateTypes');
const {
  formatBRL,
  formatDocument,
  capitalizeName,
} = require('../../../utils/formatters');
const { formatAddress } = require('./common');

const studentData = ({ full_name, email, document_number }) => ({
  client_name: capitalizeName(full_name),
  client_email: email,
  client_cpf: formatDocument(document_number),
});

const receiverData = ({ full_name, email, document_number, ...address }) => ({
  client_name: capitalizeName(full_name),
  client_email: email,
  client_cpf: formatDocument(document_number),
  client_address: address ? formatAddress(address) : 'ENDEREÇO: N/A',
});

const dataToGenerate = (invoice) => {
  const {
    transaction: { sales_items, price_product },
    user: {
      full_name: producer_name,
      document_number: producer_cpf,
      email: producer_email,
      ...userAddress
    },
    receiver,
    created_at,
  } = invoice.toJSON();

  const { student, product } = sales_items[0];

  let data = studentData(student);
  if (receiver) {
    data = receiverData(receiver);
  }
  return {
    amount: formatBRL(price_product),
    ...data,
    date: dateHelper(created_at).format(FRONTEND_DATE_WITHOUT_TIME),
    producer_cpf: formatDocument(producer_cpf),
    producer_email,
    producer_name,
    producer_address: formatAddress(userAddress),
    description: capitalizeName(product.name),
  };
};

module.exports = class PrintReceipt {
  constructor(id_user, invoice_id) {
    this.id_user = id_user;
    this.invoice_id = invoice_id;
  }

  async execute() {
    const invoice = await findOneInvoice({
      uuid: this.invoice_id,
      id_user: this.id_user,
    });
    if (!invoice) throw ApiError.badRequest('Fatura não encontrada');
    const data = dataToGenerate(invoice);
    const pdfData = await new GenerateReceiptPDF(data).execute();
    return pdfData;
  }
};
