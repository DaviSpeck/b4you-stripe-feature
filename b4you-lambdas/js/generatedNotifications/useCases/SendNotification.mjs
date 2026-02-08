import { Notifications_settings } from '../database/models/NotificationsSettings.mjs';
import { Products } from '../database/models/Products.mjs';
import { capitalizeName, formatBRL } from '../utils/formatters.mjs';
import { OneSignalAPI } from '../utils/onesignal.mjs';

const findOrCreateNotificationsSettings = async (id_user) =>
  Notifications_settings.findOne({
    where: { id_user },
    include: [{ association: 'user' }],
  }).then((settings) => {
    if (settings) return settings;
    return Notifications_settings.create({ id_user });
  });

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

const paidPayment = (data, show_product_name) => {
  const { uuid, amount, product_name = null } = data;
  return {
    title: show_product_name
      ? `Venda realizada - ${capitalizeName(product_name)}`
      : 'Venda realizada!',
    external_id: uuid,
    content: `Sua comissão ${formatBRL(amount)}`,
  };
};
const resolveNotificationData = (data, type, show_product_name) => {
  if (type === 'generated_pix') return generatedPix(data, show_product_name);
  if (type === 'generated_billet') return generatedBillet(data, show_product_name);
  if (type === 'expired_pix') return expiredPix(data, show_product_name);
  if (type === 'expired_billet') return expiredBillet(data, show_product_name);
  if (type.includes('paid')) return paidPayment(data, show_product_name);
  return false;
};

export async function sendNotification({ id_user, data, type, sound, id_product }) {
  const notificationsSettings = await findOrCreateNotificationsSettings(id_user);
  if (!notificationsSettings[type]) return;

  const {
    show_product_name,
    user: { uuid },
  } = notificationsSettings;

  const product = await Products.findOne({
    raw: true,
    attributes: ['name'],
    where: { id: id_product },
    paranoid: false,
  });

  data.product_name = product.name;

  const pushNotificationData = resolveNotificationData({ ...data, uuid }, type, show_product_name);

  if (!pushNotificationData) return;

  try {
    const oneSignal = new OneSignalAPI();
    const notificationData = {
      ...pushNotificationData,
      sound,
      type,
    };

    const result = await oneSignal.sendNotification(notificationData);

    console.log(`✅ Notification sent successfully for external_id: ${result.external_id}`);

    return result;
  } catch (error) {
    console.log(error.response?.data?.errors || error);
    throw error;
  }
}
