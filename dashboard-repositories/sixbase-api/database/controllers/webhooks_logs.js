const { Op } = require('sequelize');
const axios = require('axios');
const WebhooksLogs = require('../models/Webhooks_logs');

const createWebhookLog = async (data) => WebhooksLogs.create(data);

const updateWebhookLog = async (data, where) =>
  WebhooksLogs.update(data, { where });

const findAllWebhooksLogsForRetry = async () =>
  WebhooksLogs.findAll({
    nest: true,
    where: {
      tries: { [Op.lte]: 5 },
      success: false,
    },
    include: [
      {
        association: 'webhook',
      },
    ],
  });

const resendWebhookLog = async (id, url, reqBody) => {
  const webhook = await WebhooksLogs.findOne({
    where: { id },
    include: [{ association: 'webhook', attributes: ['token'] }],
  });

  if (!webhook) {
    throw new Error('Webhook log not found');
  }

  const webhookToken = webhook.webhook?.token;

  let requestBody = reqBody;
  if (typeof reqBody === 'string') {
    try {
      requestBody = JSON.parse(reqBody);
    } catch (e) {
      console.log('Failed to parse reqBody as JSON, using as string');
    }
  }

  const headers = {
    'Content-Type': 'application/json',
  };

  if (webhookToken && webhookToken.trim() !== '') {
    headers['X-Platform-Token'] = webhookToken;
    headers['Authorization'] = webhookToken;
  }

  try {
    const response = await axios.post(url, requestBody, {
      headers,
    });

    await updateWebhookLog(
      {
        success: true,
        tries: webhook.tries + 1,
        response_status: response.status,
        sent_at: new Date(),
      },
      { id },
    );

    return response.data;
  } catch (error) {
    const status = error.response?.status || 500;

    await updateWebhookLog(
      {
        success: false,
        tries: webhook.tries + 1,
        response_status: status,
        sent_at: new Date(),
      },
      { id },
    );

    throw new Error(`Failed to resend webhook: ${error.message}`);
  }
};

module.exports = {
  createWebhookLog,
  findAllWebhooksLogsForRetry,
  updateWebhookLog,
  resendWebhookLog,
};
