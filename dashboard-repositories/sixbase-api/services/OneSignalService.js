/* eslint-disable no-use-before-define */
const axios = require('axios');

function getOneSignalClient(platform = 'web') {
    const apiKey = platform === 'web'
        ? process.env.WEB_ONESIGNAL_API_KEY
        : process.env.APP_ONESIGNAL_API_KEY;

    return axios.create({
        baseURL: process.env.ONESIGNAL_API_URL,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
    });
}

/**
 * Faz upsert de uma subscription (Email ou SMS) para um player.
 */
async function upsertSubscription(playerId, channelType, token) {
    const body = { subscription: { type: channelType, token, enabled: true } };
    const client = getOneSignalClient();

    try {
        await client.post(
            `/apps/${process.env.WEB_ONESIGNAL_APP_ID}/users/by/onesignal_id/${playerId}/subscriptions`,
            body
        );
    } catch (err) {
        const status = err.response?.status;
        const meta = err.response?.data?.errors?.[0]?.meta;

        if (status === 409 && meta?.subscription_id) {
            await client.patch(
                `/apps/${process.env.WEB_ONESIGNAL_APP_ID}/subscriptions/${meta.subscription_id}/owner`,
                { identity: { onesignal_id: playerId } }
            );
            await client.patch(
                `/apps/${process.env.WEB_ONESIGNAL_APP_ID}/subscriptions/${meta.subscription_id}`,
                body
            );
            return;
        }

        handleError(err, `upsertSubscription(${channelType})`);

    }
}

/**
 * Atualiza tags de um usuário no OneSignal pelo playerId.
 */
async function updateUserTagsByOnesignalId(playerId, tags, platform) {
    try {
        const client = getOneSignalClient(platform);
        const resp = await client.patch(
            `/apps/${platform === 'web' ? process.env.WEB_ONESIGNAL_APP_ID : process.env.APP_ONESIGNAL_APP_ID}/users/by/onesignal_id/${playerId}`,
            { properties: { tags } }
        );
        return resp.data;
    } catch (err) {
        handleError(err, 'updateUserTagsByOnesignalId');
        return err;
    }
}

/**
 * Atualiza tags de um usuário no OneSignal pelo externalId.
 */
async function updateUserTagsByExternalId(externalId, tags, platform) {

    try {
        const client = getOneSignalClient(platform);
        const resp = await client.patch(
            `/apps/${platform === 'web' ? process.env.WEB_ONESIGNAL_APP_ID : process.env.APP_ONESIGNAL_APP_ID}/users/by/external_id/${externalId}`,
            { properties: { tags } }
        );
        return resp.data;
    } catch (err) {
        handleError(err, `updateUserTagsByExternalId:${platform}`);
        return err;
    }
}

/**
 * Upsert de email e sms de forma agrupada.
 */
async function updateUserContact(playerId, { email, sms_number }) {
    if (email) await upsertSubscription(playerId, 'Email', email);
    if (sms_number) await upsertSubscription(playerId, 'SMS', sms_number);
}

/**
 * Busca todos os dados de um usuário no OneSignal.
 */
async function getUserByPlayerId(playerId) {
    try {
        const client = getOneSignalClient();
        const resp = await client.get(
            `/apps/${process.env.WEB_ONESIGNAL_APP_ID}/users/by/onesignal_id/${playerId}`
        );
        return resp.data;
    } catch (err) {
        handleError(err, 'getUserByPlayerId');
        return err;
    }
}

function handleError(err, context = '') {
    if (err.response) {
        const e = new Error(`[${context}] OneSignal API returned an error`);
        e.status = err.response.status;
        e.details = err.response.data;
        throw e;
    }
    if (err.request) {
        const e = new Error(`[${context}] No response from OneSignal API`);
        e.status = 504;
        throw e;
    }
    const e = new Error(`[${context}] Error building request to OneSignal API`);
    e.status = 500;
    throw e;
}

module.exports = {
    upsertSubscription,
    updateUserContact,
    updateUserTagsByOnesignalId,
    updateUserTagsByExternalId,
    getUserByPlayerId,
};
