/**
 * ======================================================
 * BOTMAKER DISPATCHER — DRY RUN (SEM ENVIO REAL)
 * ======================================================
 */

const axios = require('axios'); // mantido só por compatibilidade
const { getConfig } = require('./config');
const logger = require('./logger');

module.exports = {
  async send(payload) {
    const config = getConfig();

    const isTemplate = Boolean(payload.intentIdOrName);
    const isMessage = Boolean(payload.messages);

    let endpoint;

    if (isTemplate) {
      endpoint = 'https://api.botmaker.com/v2.0/chats-actions/trigger-intent';

      logger.info('[BOTMAKER][DRY-RUN] TEMPLATE', {
        intent: payload.intentIdOrName,
        variables: payload.variables,
        to: payload.chat?.contactId,
      });
    } else if (isMessage) {
      endpoint = 'https://api.botmaker.com/v2.0/chats-actions/send-messages';

      logger.info('[BOTMAKER][DRY-RUN] MESSAGE', {
        messagesCount: payload.messages.length,
        to: payload.chat?.contactId,
      });
    } else {
      throw new Error(
        'dispatcher.send(): Payload inválido. Envie `intentIdOrName` ou `messages`.'
      );
    }

    logger.info('[BOTMAKER][DRY-RUN] Payload completo', payload);

    return {
      dryRun: true,
      endpoint,
      payload,
    };
  },
};

/**
 * ======================================================
 * BOTMAKER DISPATCHER — ENVIO REAL
 * ======================================================
 */

// const axios = require('axios');
// const { getConfig } = require('./config');
// const logger = require('./logger');

// module.exports = {
//   async send(payload) {
//     const config = getConfig();

//     const isTemplate = Boolean(payload.intentIdOrName);
//     const isMessage = Boolean(payload.messages);

//     let endpoint;
//     const body = payload;

//     if (isTemplate) {
//       endpoint = 'https://api.botmaker.com/v2.0/chats-actions/trigger-intent';

//       logger.info('[BOTMAKER] Sending TEMPLATE', {
//         intent: payload.intentIdOrName,
//         variables: payload.variables,
//         to: payload.chat?.contactId,
//       });
//     } else if (isMessage) {
//       endpoint = 'https://api.botmaker.com/v2.0/chats-actions/send-messages';

//       logger.info('[BOTMAKER] Sending MESSAGE', {
//         messagesCount: payload.messages.length,
//         to: payload.chat?.contactId,
//       });
//     } else {
//       throw new Error(
//         'dispatcher.send(): Payload inválido. Envie `intentIdOrName` ou `messages`.'
//       );
//     }

//     logger.info('[BOTMAKER] Dispatching', {
//       endpoint,
//       payloadPreview: JSON.stringify(body).substring(0, 500),
//     });

//     try {
//       const response = await axios.post(endpoint, body, {
//         headers: {
//           'access-token': config.botmaker.accessToken,
//           'Content-Type': 'application/json',
//         },
//       });

//       logger.info('[BOTMAKER] Success', {
//         status: response.status,
//         webhookNotificationId: response.data?.webhookNotificationId,
//       });

//       return response.data;
//     } catch (error) {
//       logger.error('[BOTMAKER] Failed', {
//         status: error.response?.status,
//         endpoint,
//         error: error.response?.data || error.message,
//         payloadSent: body,
//       });

//       throw error;
//     }
//   },
// };