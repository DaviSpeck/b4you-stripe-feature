const MailService = require('../MailService');
const { capitalizeName } = require('../../utils/formatters');
const { updateStudentBankAccount } = require('../../mails/messages');

class UpdateStudentBankAccount extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { student_name, producer_name, product_name, url_action, email } =
      this.data;
    const subject = 'Atualização de dados Bancários';
    const toAddress = [
      {
        Email: email,
        Name: student_name,
      },
    ];
    const variables = updateStudentBankAccount(
      capitalizeName(student_name),
      capitalizeName(producer_name),
      capitalizeName(product_name),
      url_action,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = UpdateStudentBankAccount;
