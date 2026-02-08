const MailService = require('../../MailService');
const { capitalizeName, formatBRL } = require('../../../utils/formatters');
const { generatedBillet } = require('../../../mails/payments/student/messages');
const DateHelper = require('../../../utils/helpers/date');
const { FRONTEND_DATE_WITHOUT_TIME } = require('../../../types/dateTypes');

class StudentGeneratedBillet extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      email,
      amount,
      bar_code,
      due_date,
      student_name,
      producer_name,
      product_name,
      support_email,
      url,
    } = this.data;
    const subject = 'Seu boleto chegou';
    const toAddress = [
      {
        Email: email,
        Name: student_name,
      },
    ];
    const variables = generatedBillet({
      amount: formatBRL(amount),
      bar_code,
      due_date: DateHelper(due_date).format(FRONTEND_DATE_WITHOUT_TIME),
      student_name: capitalizeName(student_name),
      producer_name: capitalizeName(producer_name),
      product_name: capitalizeName(product_name),
      support_email,
      url,
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = StudentGeneratedBillet
