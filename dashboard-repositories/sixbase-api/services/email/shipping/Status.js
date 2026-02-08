const MailService = require('../../MailService');

const {
  shipping,
  delivered,
  forwarded,
  delivery_problem,
} = require('../../../mails/shipping/templates');
const { capitalizeName } = require('../../../utils/formatters');

module.exports = class ShippingStatus extends MailService {
  constructor() {
    super(process.env.MAILJET_PASSWORD, process.env.MAILJET_USERNAME);
  }

  async shipping({ email, full_name, tracking_code, tracking_url }) {
    const capitalizedName = capitalizeName(full_name);
    const toAddress = [
      {
        Email: email,
        Name: capitalizedName,
      },
    ];
    const subject = `Seu pedido está a caminho.`;
    const variables = shipping({
      full_name: capitalizedName,
      tracking_url,
      tracking_code,
    });

    let response = null;
    // if (process.env.ENVIRONMENT === 'PRODUCTION') {
    response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    // }
    return response;
  }

  async forwarded({ email, full_name, tracking_code, tracking_url }) {
    const capitalizedName = capitalizeName(full_name);
    const toAddress = [
      {
        Email: email,
        Name: capitalizedName,
      },
    ];
    const subject = `Seu pedido está pronto para o envio.`;
    const variables = forwarded({
      full_name: capitalizedName,
      tracking_url,
      tracking_code,
    });

    let response = null;
    // if (process.env.ENVIRONMENT === 'PRODUCTION') {
    response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    // }
    return response;
  }

  async delivered({ email, full_name, tracking_url }) {
    const capitalizedName = capitalizeName(full_name);
    const toAddress = [
      {
        Email: email,
        Name: capitalizedName,
      },
    ];
    const subject = `Chegou! Seu pedido foi entregue.`;
    const variables = delivered({
      full_name: capitalizedName,
      tracking_url,
    });

    let response = null;
    // if (process.env.ENVIRONMENT === 'PRODUCTION') {
    response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    // }
    return response;
  }

  async delivery_problem({ email, full_name, support_email, support_phone }) {
    const capitalizedName = capitalizeName(full_name);
    const toAddress = [
      {
        Email: email,
        Name: capitalizedName,
      },
    ];
    const subject = `Aviso importante sobre seu pedido.`;
    const variables = delivery_problem({
      full_name: capitalizedName,
      support_email,
      support_phone,
    });

    let response = null;
    // if (process.env.ENVIRONMENT === 'PRODUCTION') {
    response = await this.sendMail({
      subject,
      toAddress,
      variables,
    });
    /* } */
    return response;
  }
};
