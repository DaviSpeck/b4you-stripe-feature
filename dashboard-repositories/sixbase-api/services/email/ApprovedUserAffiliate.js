const MailService = require('../MailService');

const { newApprovedAffiliateUser } = require('../../mails/messages');

class ApprovedUserAffiliate extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { affiliate_name, email, commission, support_email, product_name } =
      this.data;
    const subject = 'Afiliação aprovada';
    const toAddress = [
      {
        Email: email,
        Name: affiliate_name,
      },
    ];
    const variables = newApprovedAffiliateUser(
      affiliate_name,
      support_email,
      commission,
      product_name,
    );
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = ApprovedUserAffiliate;
