import SQS from '../queues/aws.mjs';

export class WebhookService {
  constructor() {}

  async sendWebhook(data) {
    try {
      const result = await SQS.add('webhookEvent', {
        id_product: data.id_product,
        id_user: data.id_user,
        id_sale_item: data.id_sale_item || null,
        id_event: data.id_event,
        id_cart: data.id_cart || null,
        id_affiliate: data.id_affiliate || null,
      });
      return result;
    } catch (error) {
      console.error('Error sending webhook:', error);
      throw error;
    }
  }
}
