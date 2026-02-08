import mailjetService from 'node-mailjet';

export class MailService {
  #mailjet;

  constructor({ userName, password, emailSender, templateID }) {
    this.#mailjet = mailjetService.apiConnect(password, userName);
    this.emailSender = emailSender;
    this.templateID = templateID;
  }

  /**
   * @typedef {Object} toAddress
   * @param {string} Email
   * @param {string} Name
   */

  /**
   * @param {string} subject
   * @param {number} templateID
   * @param {toAddress[]} toAddress
   * @param {object[]} variables
   */
  async sendMail({ subject, toAddress, variables, customId = '0000', cc = null }) {
    try {
      console.log('sending email to ', toAddress);
      const response = await this.#mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: this.emailSender,
              Name: 'B4you',
            },
            To: toAddress,
            TemplateID: +this.templateID,
            TemplateLanguage: true,
            Subject: subject,
            Variables: variables,
            CustomID: customId,
            CC: cc,
          },
        ],
      });
      console.log('respponse', response);
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}
