import mailjetService from 'node-mailjet';

export class ImprovedMailService {
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
    const startTime = Date.now();

    try {
      // Clean log for recipients
      const recipients = toAddress.map((addr) => `${addr.Name} <${addr.Email}>`).join(', ');
      console.log(`📧 Sending email to: ${recipients}`);
      console.log(`📋 Subject: ${subject}`);

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

      const sendTime = Date.now() - startTime;

      // Clean response logging
      this.logEmailResponse(response, sendTime);

      return response;
    } catch (error) {
      const sendTime = Date.now() - startTime;
      console.error(`❌ Email failed after ${sendTime}ms:`, error.message);
      throw error;
    }
  }

  /**
   * Log email response in a clean, informative way
   */
  logEmailResponse(response, sendTime) {
    try {
      const { response: httpResponse, body } = response;

      // Extract useful information
      const status = httpResponse?.status || 'Unknown';
      const statusText = httpResponse?.statusText || 'Unknown';
      const messageId = body?.Messages?.[0]?.To?.[0]?.MessageID || 'Unknown';
      const requestId = httpResponse?.headers?.['x-mj-request-guid'] || 'Unknown';

      // Success indicators
      const isSuccess = status >= 200 && status < 300;
      const statusIcon = isSuccess ? '✅' : '❌';

      console.log(`${statusIcon} Email Status: ${status} ${statusText}`);
      console.log(`📨 Message ID: ${messageId}`);
      console.log(`🆔 Request ID: ${requestId}`);
      console.log(`⏱️  Send Time: ${sendTime}ms`);

      if (isSuccess) {
        console.log(
          `📬 Email sent successfully to ${body?.Messages?.[0]?.To?.length || 0} recipient(s)`
        );
      } else {
        console.log(`⚠️  Email delivery may have issues`);
      }

      // Log any errors from Mailjet
      if (body?.Messages?.[0]?.Errors) {
        console.log(`🚨 Mailjet Errors:`, body.Messages[0].Errors);
      }
    } catch (logError) {
      console.log('📧 Email sent (response logging failed)');
    }
  }

  /**
   * Get email statistics for monitoring
   */
  getEmailStats(response) {
    try {
      const { response: httpResponse, body } = response;

      return {
        status: httpResponse?.status,
        messageId: body?.Messages?.[0]?.To?.[0]?.MessageID,
        requestId: httpResponse?.headers?.['x-mj-request-guid'],
        recipientCount: body?.Messages?.[0]?.To?.length || 0,
        hasErrors: !!body?.Messages?.[0]?.Errors?.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: 'Failed to parse email stats',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
