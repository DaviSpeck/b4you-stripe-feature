const PrintInvoiceToPDF = require('../../../reports/PrintInvoiceToPDF');

module.exports = class GenerateReceiptPDF {
  constructor({
    client_name,
    client_cpf,
    client_email,
    producer_name,
    producer_cpf,
    producer_address,
    producer_email,
    date,
    amount,
    description,
  }) {
    this.data = {
      client_name,
      client_cpf,
      client_email,
      producer_name,
      producer_cpf,
      producer_address,
      producer_email,
      date,
      amount,
      description,
    };
  }

  async execute() {
    const pdf = await new PrintInvoiceToPDF(this.data).pdf();
    return pdf;
  }
};
