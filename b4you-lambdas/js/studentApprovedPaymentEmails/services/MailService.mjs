import mailjetService from 'node-mailjet';

export class MailService {
  #mailjet;

  constructor({ username, password, emailSender, templateID }) {
    this.#mailjet = mailjetService.apiConnect(password, username);
    this.emailSender = emailSender;
    this.templateID = templateID;
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
  async sendMail({ subject, toAddress, variables, customId = '0000', cc = null }) {
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
    return response;
  }
}
