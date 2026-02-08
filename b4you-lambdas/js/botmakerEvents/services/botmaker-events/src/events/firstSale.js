const dispatcher = require('../core/dispatcher');
const logger = require('../core/logger');
const { getConfig } = require('../core/config');

module.exports = async function firstSale(payload) {
  const config = getConfig();

  try {
    const phone = String(payload.phone || '').replace(/\D/g, '');
    const firstName = String(payload.name || '').split(' ')[0] || '';

    const productName = payload.productName || '';
    const amount = Number(payload.amount || 0).toFixed(2);
    const paidAt = payload.paidAt || '';
    const daysAvailable = 'D+30';

    const roleType = payload.roleType || 'generic';

    const intentIdOrName = payload.__templateKey;

    if (!intentIdOrName) {
      throw new Error('Template key not provided for first_sale event');
    }

    let variables = {};

    /**
     * Mantém a regra atual de variáveis por role
     * (template continua decidindo o que usa)
     */
    if (roleType === 'producer') {
      variables = {
        firstName,
        productName,
        orderValue: amount,
        date: paidAt,
        daysAvailable,
      };
    }

    if (roleType === 'affiliate') {
      // TEMPLATE NÃO USA VARIÁVEL
      variables = {};
    }

    if (roleType === 'generic') {
      // TEMPLATE GENÉRICO ESTÁ QUEBRADO → NÃO PODE ENVIAR NADA
      variables = {};
    }

    const botmakerPayload = {
      chat: {
        channelId: config.botmaker.whatsappChannelId,
        contactId: phone,
      },
      intentIdOrName,
      variables,
      webhookPayload: JSON.stringify(payload),
    };

    await dispatcher.send(botmakerPayload);

    logger.info('first_sale event dispatched successfully', {
      phone,
      firstName,
      roleType,
      intentIdOrName,
      variables,
    });
  } catch (err) {
    logger.error('Error in first_sale handler', {
      message: err.message,
      botmakerError: err.response?.data,
      payload,
    });
    throw err;
  }
};