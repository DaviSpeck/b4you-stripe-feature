import { Sales_items } from '../database/models/Sales_items.mjs';
import { trackingEmail } from '../email/messages.mjs';
import { capitalizeName, formatUrl } from '../utils/formatters.mjs';
import aws from '../queues/aws.mjs';
import { Commissions } from '../database/models/Commissions.mjs';
const TYPE_SUPPLIER = 4;
export class UpdateTracking {
  constructor({ MailService }) {
    this.MailService = MailService;
  }

  async execute(rows) {
    for await (const row of rows) {
      const saleItem = await Sales_items.findOne({
        nest: true,
        where: {
          uuid: row[0],
        },
        include: [
          { association: 'product', attributes: ['default_url_tracking', 'name', 'id', 'id_user'] },
          { association: 'student', attributes: ['full_name', 'email'] },
        ],
      });
      if (saleItem) {
        console.log(JSON.stringify(saleItem));
        let emailTemplate = null;
        if (!row[5] && saleItem.product.default_url_tracking && row[4]) {
          await Sales_items.update(
            { tracking_code: row[4], tracking_url: saleItem.product.default_url_tracking },
            { where: { id: saleItem.id } }
          );
          emailTemplate = trackingEmail(
            capitalizeName(saleItem.student.full_name),
            row[4],
            formatUrl(saleItem.product.default_url_tracking),
            saleItem.product.name
          );
        } else if (row[4] && row[5]) {
          await Sales_items.update(
            { tracking_code: row[4], tracking_url: row[5] },
            { where: { id: saleItem.id } }
          );
          emailTemplate = trackingEmail(
            capitalizeName(saleItem.student.full_name),
            row[4],
            formatUrl(row[5]),
            saleItem.product.name
          );
        }
        await this.MailService.sendMail({
          subject: 'Código de rastreio atualizado',
          toAddress: [
            {
              Email: saleItem.student.email,
              Name: capitalizeName(saleItem.student.full_name),
            },
          ],
          variables: emailTemplate,
        });
        await aws.add('webhookEvent', {
          id_product: saleItem.id_product,
          id_sale_item: saleItem.id,
          id_user: saleItem.product.id_user,
          id_event: 11, // tracking
        });
        const commissions = await Commissions.findAll({
          raw: true,
          where: { id_sale_item: saleItem.id, id_role: TYPE_SUPPLIER },
        });
        if (commissions.length > 0) {
          for await (const c of commissions) {
            await aws.add('webhookEvent', {
              id_product: saleItem.id_product,
              id_sale_item: saleItem.id,
              id_user: c.id_user,
              id_event: 11, // tracking
            });
          }
        }
      }
    }
  }
}
