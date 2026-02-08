const MailService = require('../../MailService');
const { capitalizeName, formatBRL } = require('../../../utils/formatters');
const {
  refundWarrantyRequested,
} = require('../../../mails/refunds/student/messages');
const DateHelper = require('../../../utils/helpers/date');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../../types/dateTypes');

class StudentRefundWarranty extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, amount, full_name, product_name, date } = this.data;
    const subject = 'Solicitação de reembolso em garantia';
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = refundWarrantyRequested({
      amount: formatBRL(amount),
      date: DateHelper(date).format(FRONTEND_DATE_WITHOUT_TIME),
      full_name: capitalizeName(full_name),
      product_name: capitalizeName(product_name),
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = StudentRefundWarranty;
