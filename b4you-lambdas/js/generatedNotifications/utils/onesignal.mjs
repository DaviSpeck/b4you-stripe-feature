import axios from 'axios';

export class OneSignalAPI {
  constructor() {
    const { ONESIGNAL_APPID, ONESIGNAL_AUTHORIZATION } = process.env;

    this.appId = ONESIGNAL_APPID;
    this.authorization = `Basic ${ONESIGNAL_AUTHORIZATION}`;

    this.baseURL = 'https://api.onesignal.com';
  }

  async sendNotification(notificationData) {
    console.log(notificationData);

    const payload = {
      app_id: this.appId,
      target_channel: 'push',
      include_external_user_ids: [notificationData.external_id],
      headings: { en: notificationData.title },
      contents: { en: notificationData.content },
      ios_sound: 'coin_sound.wav',
      android_channel_id:
        notificationData.android_channel_id || '9d534ac4-c42d-4d72-b8a2-e9b573b547bf',
      data: {
        external_id: notificationData.external_id,
        type: notificationData.type,
      },
    };

    try {
      const response = await axios.post(`${this.baseURL}/notifications`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authorization,
        },
      });

      const data = response.data;
      const rawErrors = data?.errors;
      const errors = Array.isArray(rawErrors)
        ? rawErrors
        : typeof rawErrors === 'string'
          ? [rawErrors]
          : [];
      const NOT_SUBSCRIBED = 'All included players are not subscribed';

      const hasCriticalError = errors.includes(NOT_SUBSCRIBED);
      const hasValidId = typeof data?.id === 'string' && data.id.length > 0;

      if (hasCriticalError || !hasValidId) {
        console.warn(
          'Primary send returned errors or empty id. Falling back via subscription_ids...',
          { errors, id: data?.id }
        );

        const enabledIds = await this.fetchEnabledSubscriptionIds(notificationData.external_id);

        if (enabledIds.length === 0) {
          console.warn('Retry aborted: no enabled subscription ids found for user.');
          throw new Error('No enabled subscriptions to target.');
        }

        const retryRes = await this.sendBySubscriptionIds(enabledIds, notificationData);
        console.log('OneSignal notification sent successfully (by subscription_ids):', retryRes);
        return retryRes;
      }

      console.log('OneSignal notification sent successfully (by external_id):', data);
      return data;
    } catch (error) {
      console.error(
        'Error sending OneSignal notification (by external_id):',
        error.response?.data || error.message
      );
      throw error;
    }
  }

  async fetchEnabledSubscriptionIds(externalId) {
    try {
      const res = await axios.get(
        `${this.baseURL}/apps/${this.appId}/users/by/external_id/${encodeURIComponent(externalId)}`,
        {
          headers: { Authorization: this.authorization },
        }
      );

      console.log(`Res subscriptions for ${encodeURIComponent(externalId)}:`, res.data);

      const subscriptions = Array.isArray(res.data?.subscriptions) ? res.data.subscriptions : [];
      const enabledIds = subscriptions
        .filter((s) => s?.enabled)
        .map((s) => s.id)
        .filter(Boolean);

      console.log('Enabled subscription ids:', enabledIds);
      return enabledIds;
    } catch (err) {
      console.error('Error fetching enabled subscriptions:', err.response?.data || err.message);
      return [];
    }
  }

  async sendBySubscriptionIds(subscriptionIds, notificationData) {
    const payload = {
      app_id: this.appId,
      target_channel: 'push',
      headings: { en: notificationData.title },
      contents: { en: notificationData.content },
      include_subscription_ids: subscriptionIds,
      ios_sound: 'coin_sound.wav',
      android_channel_id:
        notificationData.android_channel_id || '9d534ac4-c42d-4d72-b8a2-e9b573b547bf',
      data: {
        external_id: notificationData.external_id,
        type: notificationData.type,
      },
    };

    try {
      const res = await axios.post(`${this.baseURL}/notifications?c=push`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.authorization,
        },
      });

      console.log('OneSignal notification sent successfully (by subscription_ids):', res.data);
      return res.data;
    } catch (err) {
      console.error(
        'Error sending OneSignal notification (by subscription_ids):',
        err.response?.data || err.message
      );
      throw err;
    }
  }
}
