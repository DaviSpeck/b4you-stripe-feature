const MailService = require('../MailService');
const { capitalizeName } = require('../../utils/formatters');
const { classroomAccessTemplate } = require('../../mails/messages');

class ClassroomAccess extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const {
      full_name,
      email,
      product_name,
      productor_name,
      support_email,
      url_action,
    } = this.data;
    const subject = `Seu acesso a ${product_name} chegou!`;
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = classroomAccessTemplate(
      capitalizeName(full_name),
      url_action,
      capitalizeName(product_name),
      capitalizeName(productor_name),
      support_email,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = ClassroomAccess;
