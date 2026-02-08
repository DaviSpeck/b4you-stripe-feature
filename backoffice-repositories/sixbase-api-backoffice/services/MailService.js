const mailjetService = require('node-mailjet');

const { MAILJET_EMAIL_SENDER, MAILJET_TEMPLATE_ID } = process.env;
class MailService {
  #mailjet;

  constructor(password, username) {
    this.#mailjet = mailjetService.connect(password, username);
  }

  /**
   * @typedef {Object} toAddress
   * @param {string} Email
   * @param {string} Name
   */

  /**
   *
   * @param {string} subject
   * @param {number} templateID
   * @param {toAddress[]} toAddress
   * @param {object[]} variables
   */
  async sendMail({
    subject,
    toAddress,
    variables,
    customId = '0000',
    cc = null,
  }) {
    const response = await this.#mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: MAILJET_EMAIL_SENDER,
              Name: 'B4you',
            },
            To: toAddress,
            TemplateID: +MAILJET_TEMPLATE_ID,
            TemplateLanguage: true,
            Subject: subject,
            Variables: variables,
            CustomID: customId,
            CC: cc,
          },
        ],
      });
    return response;
  }
}
module.exports = MailService;
