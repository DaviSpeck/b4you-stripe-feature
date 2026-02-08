const { capitalizeName } = require('../../utils/formatters');
const {
  coproductionCanceledProducerTemplate,
} = require('../../mails/messages');

module.exports = class CoproductionCanceledProducer {
  #data;

  #EmailService;

  constructor(data, EmailService) {
    this.#data = data;
    this.#EmailService = EmailService;
  }

  async send() {
    const { email, full_name, producer, product_name } = this.#data;
    const subject = 'Coprodução cancelada pelo produtor';
    const toAddress = [
      {
        Email: email,
        Name: producer,
      },
    ];
    const variables = coproductionCanceledProducerTemplate(
      capitalizeName(producer),
      capitalizeName(full_name),
      capitalizeName(product_name),
    );
    const response = await this.#EmailService.sendMail({
      subject,
      toAddress,
      variables,
    });
    return response;
  }
};
