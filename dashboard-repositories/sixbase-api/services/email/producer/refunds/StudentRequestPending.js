const MailService = require('../../../MailService');
const { capitalizeName, formatBRL } = require('../../../../utils/formatters');
const {
  refundPendingRequested,
} = require('../../../../mails/refunds/producer/messages');
const DateHelper = require('../../../../utils/helpers/date');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../../../types/dateTypes');

class StudentRequestPending extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      email,
      full_name,
      product_name,
      amount,
      student_name,
      student_email,
      student_whatsapp,
      due_date,
      sale_uuid,
    } = this.data;
    const subject = `Reembolso em garantia solicitado por estudante`;
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = refundPendingRequested({
      full_name: capitalizeName(full_name),
      product_name: capitalizeName(product_name),
      amount: formatBRL(amount),
      student_name: capitalizeName(student_name),
      student_email,
      student_whatsapp,
      due_date: DateHelper(due_date).format(FRONTEND_DATE_WITHOUT_TIME),
      sale_uuid,
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = StudentRequestPending;
