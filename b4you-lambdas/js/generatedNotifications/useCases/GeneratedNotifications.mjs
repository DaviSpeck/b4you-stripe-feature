import { Sales_items } from '../database/models/Sales_items.mjs';

const findSaleItemWithCommissions = async (where) => {
  const saleItem = await Sales_items.findOne({
    where,
    attributes: ['id', 'uuid', 'id_status', 'payment_method', 'id_product', 'src', 'created_at'],
    include: [
      {
        association: 'commissions',
        attributes: ['id', 'amount', 'id_user'],
      },
    ],
  });
  if (!saleItem) return null;
  return saleItem.toJSON();
};

const getNotificationType = (id_status, payment_method) => {
  let status;
  if (id_status === 1) {
    status = 'generated';
  }
  if (id_status === 2) {
    status = 'paid';
  }

  if (id_status === 7) {
    status = 'expired';
  }

  return `${status}_${payment_method}`;
};

export class GeneratedNotifications {
  #SendNotificationService;
  constructor(SendNotificationService) {
    this.#SendNotificationService = SendNotificationService;
  }

  async execute({ sale_item_id, sound }) {
    const saleItem = await findSaleItemWithCommissions({
      id: +sale_item_id,
    });
    if (!saleItem) return null;
    const notificationType = getNotificationType(saleItem.id_status, saleItem.payment_method);
    const { commissions } = saleItem;
    for await (const { id_user, amount } of commissions) {
      try {
        await this.#SendNotificationService({
          id_user,
          data: { amount },
          type: notificationType,
          sound,
          id_product: saleItem.id_product,
        });
      } catch (error) {
        console.log('error aqui -> ', error);
      }
    }

    return saleItem;
  }
}
