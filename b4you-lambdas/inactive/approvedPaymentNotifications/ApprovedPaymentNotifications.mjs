import { PushNotification } from './PushNotification.mjs';
import { formatBRL } from './utils.mjs';
import { ConfirmePaymentEmail } from './ConfirmedPaymentSale.mjs';

export class ApprovedPaymentNotifications {
  constructor({ sale_uuid }, database) {
    this.sale_uuid = sale_uuid;
    this.database = database;
  }

  async execute() {
    const saleItem = await this.database.findSaleItem(this.sale_uuid);
    const { id: id_sale_item, uuid: saleItemUuid, src, created_at, id_product } = saleItem;
    const product = await this.database.findProduct(id_product);
    const commissions = await this.database.findCommissions(id_sale_item);
    const producer = await this.database.findUser(product.id_user);
    const producerCommission = commissions.find((t) => t.id_user === producer.id);
    const notificationsSettings = await this.database.findUserNotificationsSettings(product.id_user);
    console.log('notifications settings', product.id_user, notificationsSettings)
    if (notificationsSettings.mail_approved_payment) {
      await new ConfirmePaymentEmail({
        full_name: producer.full_name,
        product_name: product.name,
        email: producer.email,
        uuid: saleItemUuid,
        created_at,
        commission: formatBRL(producerCommission.amount),
        src,
      }).send();
    }

    await new PushNotification({
      title: `Venda realizada!`,
      external_id: producer.uuid,
      content: `Sua comissão ${formatBRL(producerCommission.amount)}`,
    }).send();

    if (saleItem.id_affiliate) {
      const affiliate = await this.database.findAffiliate(saleItem.id_affiliate);
      const affiliateCommission = commissions.find((t) => t.id_user === affiliate.id);
      await new ConfirmePaymentEmail({
        full_name: affiliate.full_name,
        product_name: product.name,
        email: affiliate.email,
        uuid: saleItemUuid,
        created_at,
        commission: formatBRL(affiliateCommission.amount),
        src,
      }).send();

      await new PushNotification({
        title: `Venda realizada!`,
        external_id: affiliate.uuid,
        content: `Sua comissão ${formatBRL(affiliateCommission.amount)}`,
      }).send();
    }
    const coproducers = await this.database.findCoproducers(id_product);
    try {
      for await (const coproducer of coproducers) {
        const { full_name, email, id, uuid: external_id } = coproducer;
        const coproducerCommission = transactions.find((t) => t.id_user === id);
        await new ConfirmePaymentEmail({
          full_name,
          product_name: product.name,
          email,
          uuid: saleItemUuid,
          created_at,
          commission: formatBRL(coproducerCommission.amount),
          src,
        }).send();

        await new PushNotification({
          title: `Venda realizada!`,
          external_id,
          content: `Sua comissão ${formatBRL(coproducerCommission.amount)}`,
        }).send();
      }
    } catch (error) {
      console.log(error);
    }
  }
}
