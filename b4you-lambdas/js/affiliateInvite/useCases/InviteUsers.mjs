import { slugify } from '../utils/formatters.mjs';
import { Products } from '../database/models/Products.mjs';
import { Users } from '../database/models/Users.mjs';
import { ProducerInvite } from '../emails/ProducerInvite.mjs';
import { RegisterPage } from '../emails/RegisterPage.mjs';

export class InviteUsers {
  constructor(MailService) {
    this.MailService = MailService;
  }

  async execute({ email, producer_name, product_name, id_product, url_dashboard }) {
    const user = await Users.findOne({
      raw: true,
      where: {
        email,
      },
      attributes: ['email', 'full_name'],
    });
    if (user) {
      const product = await Products.findOne({
        raw: true,
        attributes: ['name', 'uuid'],
        where: {
          id: id_product,
        },
      });
      await new ProducerInvite(this.MailService).send({
        email: user.email,
        producer_name,
        affiliate_name: user.full_name,
        product_name,
        url: `${url_dashboard}/vitrine/produto/${slugify(product.name)}/${product.uuid}`,
      });
    } else {
      await new RegisterPage(this.MailService).send({
        email,
        producer_name,
        url_dashboard,
      });
    }
  }
}
