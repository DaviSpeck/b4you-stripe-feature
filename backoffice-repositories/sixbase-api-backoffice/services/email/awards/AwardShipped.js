const MailService = require('../../MailService');
const { capitalizeName } = require('../../../utils/formatters');
const { awardAchievedAndShipped } = require('../../../mails/awards/messages');

class AwardShipped extends MailService {
  constructor(data) {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
    this.data = data;
  }

  async send() {
    const { email, full_name, milestone, tracking_code, tracking_link } =
      this.data;
    const subject = `Sua premiação de R$ ${milestone} foi enviada!`;
    const toAddress = [
      {
        Email: email,
        Name: full_name,
      },
    ];
    const variables = awardAchievedAndShipped({
      full_name: capitalizeName(full_name),
      milestone,
      tracking_code,
      tracking_link,
    });
    const response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
}

module.exports = AwardShipped;
