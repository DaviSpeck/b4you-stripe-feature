const {
  findOrCreateNotificationsSettings,
} = require('../../../database/controllers/notifications_settings');
const PushNotifications = require('../../common/notifications/PushNotification');
const { formatBRL, capitalizeName } = require('../../../utils/formatters');

const paidPix = (data, show_product_name) => {
  const { uuid, amount, product_name = null } = data;
  return {
    title: show_product_name
      ? `Venda realizada - ${capitalizeName(product_name)}`
      : 'Venda realizada!',
    external_id: uuid,
    content: `Sua comissão ${formatBRL(amount)}`,
  };
};

const paidBillet = (data, show_product_name) => {
  const { uuid, amount, product_name = null } = data;
  return {
    title: show_product_name
      ? `Venda realizada - ${capitalizeName(product_name)}`
      : 'Venda realizada!',
    external_id: uuid,
    content: `Sua comissão ${formatBRL(amount)}`,
  };
};

const paidCard = (data, show_product_name) => {
  const { uuid, amount, product_name = null } = data;
  return {
    title: show_product_name
      ? `Venda realizada - ${capitalizeName(product_name)}`
      : 'Venda realizada!',
    external_id: uuid,
    content: `Sua comissão ${formatBRL(amount)}`,
  };
};

const generatedPix = (data) => {
  const { uuid, amount } = data;
  return {
    title: 'Pix gerado!',
    external_id: uuid,
    content: `Sua comissão ${formatBRL(amount)}`,
  };
};

const generatedBillet = (data) => {
  const { uuid, amount } = data;
  return {
    title: 'Boleto gerado!',
    external_id: uuid,
    content: `Sua comissão ${formatBRL(amount)}`,
  };
};

const expiredPix = (data) => {
  const { uuid, amount } = data;
  return {
    title: 'Pix expirado!',
    external_id: uuid,
    content: `Sua comissão ${formatBRL(amount)}`,
  };
};

const expiredBillet = (data) => {
  const { uuid, amount } = data;
  return {
    title: 'Boleto expirado!',
    external_id: uuid,
    content: `Sua comissão ${formatBRL(amount)}`,
  };
};

const requestedRefund = (data) => {
  const { uuid } = data;
  return {
    title: 'Reembolso em garantia solicitado',
    external_id: uuid,
    content: `Acesse o dashboard para maiores informações`,
  };
};

const resolveNotificationData = (data, type, show_product_name) => {
  if (type === 'paid_pix') return paidPix(data, show_product_name);
  if (type === 'paid_billet') return paidBillet(data, show_product_name);
  if (type === 'paid_card') return paidCard(data, show_product_name);
  if (type === 'generated_pix') return generatedPix(data, show_product_name);
  if (type === 'generated_billet')
    return generatedBillet(data, show_product_name);
  if (type === 'expired_pix') return expiredPix(data, show_product_name);
  if (type === 'expired_billet') return expiredBillet(data, show_product_name);
  if (type === 'requested_refund')
    return requestedRefund(data, show_product_name);

  return false;
};

module.exports = class {
  constructor({ id_user, data, type }) {
    this.id_user = id_user;
    this.data = data;
    this.type = type;
  }

  async execute() {
    const notificationsSettings = await findOrCreateNotificationsSettings(
      this.id_user,
    );
    if (!notificationsSettings[this.type]) return;

    const {
      show_product_name,
      user: { uuid },
    } = notificationsSettings;
    this.data.uuid = uuid;
    const pushNotificationData = resolveNotificationData(
      this.data,
      this.type,
      show_product_name,
    );

    if (pushNotificationData)
      await new PushNotifications(pushNotificationData).send();
  }
};
