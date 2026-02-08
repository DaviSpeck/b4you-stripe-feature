const { capitalizeName } = require('../../utils/formatters');
const { changeAffiliateCommission } = require('../../mails/messages');

class ChangeCommissionUserAffiliate {
  #data;

  #EmailService;

  constructor(data, EmailService) {
    this.#data = data;
    this.#EmailService = EmailService;
  }

  async send() {
    const {
      email,
      affiliate_name,
      old_commission,
      new_commission,
      product_name,
    } = this.#data;
    const subject = 'Alteração de comissão';
    const toAddress = [
      {
        Email: email,
        Name: affiliate_name,
      },
    ];
    const variables = changeAffiliateCommission(
      capitalizeName(affiliate_name),
      old_commission,
      new_commission,
      capitalizeName(product_name),
    );

    const response = await this.#EmailService.sendMail({
      subject,
      toAddress,
      variables,
    });

    return response;
  }
}

module.exports = ChangeCommissionUserAffiliate;
