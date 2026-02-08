import { Op } from 'sequelize';
import { Sales_items } from '../database/models/SalesItems.mjs';
import { Subscriptions } from '../database/models/Subscriptions.mjs';
import { SubscriptionsLogs } from '../database/models/SubscriptionsLogs.mjs';
import { SubscriptionReactivation } from '../emails/SubscriptionReactivation.mjs';
import { date } from '../utils/date.mjs';
import { sanitizeMailjetResponse } from '../utils/mailUtils.mjs';

export class SubscriptionReactivationUseCase {
  constructor(database, mailService) {
    this.database = database;
    this.mailService = mailService;
  }

  async checkEmailLogs(subscriptionId) {
    const emailLogs = await SubscriptionsLogs.findAll({
      where: {
        id_subscription: subscriptionId,
        email_type: { [Op.in]: ['d1', 'd2', 'd3', 'd4', 'd5', 'd15', 'd30'] },
      },
      order: [['created_at', 'DESC']],
    });
    return emailLogs;
  }

  async checkRenewedSubscription(subscription) {
    return await Subscriptions.findOne({
      where: {
        id_user: subscription.id_user,
        id_product: subscription.id_product,
        active: 1,
        id_status: 1,
        created_at: { [Op.gt]: subscription.canceled_at },
      },
    });
  }

  async getSubscriptionData(subscription) {
    const lastSaleItem = await Sales_items.findOne({
      raw: true,
      where: { id_subscription: subscription.id },
      order: [['id', 'desc']],
      attributes: ['price_total', 'id_offer', 'id_sale'],
    });

    if (!lastSaleItem) {
      return {
        sale: null,
        amount: null,
        id_offer: null,
        offer_uuid: null,
        support_email: null,
        support_whatsapp: null,
      };
    }

    const [sale, offer, productSupport] = await Promise.all([
      this.database.sequelize.query(
        'select full_name, email from sales where id = :id_sale',
        { replacements: { id_sale: lastSaleItem.id_sale }, plain: true }
      ),
      lastSaleItem?.id_offer
        ? this.database.sequelize.query(
            'select uuid from product_offer where id = :id_offer',
            { replacements: { id_offer: lastSaleItem.id_offer }, plain: true }
          )
        : Promise.resolve(null),
      this.database.sequelize.query(
        'select support_email, support_whatsapp from products where id = :id_product',
        {
          replacements: { id_product: subscription['product.id'] },
          plain: true,
        }
      ),
    ]);

    const offer_uuid = offer?.uuid || null;

    return {
      sale,
      amount: lastSaleItem?.price_total || null,
      id_offer: lastSaleItem?.id_offer || null,
      offer_uuid: offer_uuid,
      support_email: productSupport?.support_email || null,
      support_whatsapp: productSupport?.support_whatsapp || null,
    };
  }

  async sendReactivationEmail(subscription, emailType) {
    const {
      sale,
      amount,
      id_offer,
      offer_uuid,
      support_email,
      support_whatsapp,
    } = await this.getSubscriptionData(subscription);

    const hasProduct =
      subscription['product.id'] && subscription['product.name'];

    if (!sale || !hasProduct) {
      return false;
    }

    let mailjetResponse = null;
    let emailSent = false;

    try {
      mailjetResponse = await new SubscriptionReactivation(
        this.mailService
      ).send({
        email: sale.email,
        full_name: sale.full_name,
        product_name: subscription['product.name'],
        amount: amount,
        isFirstEmail: emailType === 'd15',
        sendAt: null,
        id_offer: id_offer,
        offer_uuid: offer_uuid,
        support_email: support_email,
        support_whatsapp: support_whatsapp,
      });
      emailSent = true;
    } catch (error) {
      console.log(error);
      mailjetResponse = { error: error.message, status: 'failed' };
    }

    const sanitizedMailjetResponse = sanitizeMailjetResponse(mailjetResponse);

    await SubscriptionsLogs.create({
      id_subscription: subscription.id,
      action: emailSent ? 'email_sent' : 'email_failed',
      email_type: emailType,
      email_sent_at: emailSent ? date().now() : null,
      mailjet_message_id:
        mailjetResponse?.body?.Messages?.[0]?.To?.[0]?.MessageID || null,
      mailjet_message_uuid:
        mailjetResponse?.body?.Messages?.[0]?.To?.[0]?.MessageUUID || null,
      mailjet_status: emailSent ? 'success' : 'failed',
      mailjet_response: sanitizedMailjetResponse,
      details: {
        email: sale.email,
        full_name: sale.full_name,
        product_name: subscription['product.name'],
        amount: amount,
        days_since_canceled: Math.floor(
          (new Date() - new Date(subscription.canceled_at)) /
            (1000 * 60 * 60 * 24)
        ),
        id_offer: id_offer,
        offer_uuid: offer_uuid,
        support_email: support_email,
        support_whatsapp: support_whatsapp,
      },
    });

    return emailSent;
  }

  async processReactivations() {
    const DATABASE_DATE = 'YYYY-MM-DD';
    const subscriptionsForReactivation = await Subscriptions.findAll({
      raw: true,
      where: {
        active: 0,
        id_status: 3,
        canceled_at: {
          [Op.between]: [
            date().subtract(31, 'days').format(DATABASE_DATE),
            date().subtract(10, 'days').format(DATABASE_DATE),
          ],
        },
      },
      include: [
        {
          association: 'product',
          attributes: ['id', 'name'],
          paranoid: true,
        },
      ],
    });

    const results = {
      d1_emails: 0,
      d2_emails: 0,
      d3_emails: 0,
      d4_emails: 0,
      d5_emails: 0,
      d15_emails: 0,
      d30_emails: 0,
      already_sent: 0,
      renewed: 0,
      errors: 0,
      email_failures: 0,
    };

    for (const subscription of subscriptionsForReactivation) {
      try {
        const renewedSubscription = await this.checkRenewedSubscription(
          subscription
        );
        if (renewedSubscription) {
          results.renewed++;
          continue;
        }

        const emailLogs = await this.checkEmailLogs(subscription.id);
        const canceledAt = new Date(subscription.canceled_at);
        const today = new Date();
        const daysSinceCanceled = Math.floor(
          (today - canceledAt) / (1000 * 60 * 60 * 24)
        );
        const d15Sent = emailLogs.some((log) => log.email_type === 'd15');
        const d30Sent = emailLogs.some((log) => log.email_type === 'd30');

        if (daysSinceCanceled > 31) {
          continue;
        }

        if (daysSinceCanceled >= 15 && daysSinceCanceled <= 31 && !d15Sent) {
          const success = await this.sendReactivationEmail(subscription, 'd15');
          if (success) {
            results.d15_emails++;
          } else {
            results.email_failures++;
          }
        }
        if (daysSinceCanceled >= 30 && daysSinceCanceled <= 31 && !d30Sent) {
          const success = await this.sendReactivationEmail(subscription, 'd30');
          if (success) {
            results.d30_emails++;
          } else {
            results.email_failures++;
          }
        }

        if (!d15Sent && !d30Sent && daysSinceCanceled < 15) {
          continue;
        } else if (d15Sent && d30Sent) {
          results.already_sent++;
        }
      } catch (error) {
        console.log(error);
        results.errors++;
      }
    }

    return results;
  }
}
