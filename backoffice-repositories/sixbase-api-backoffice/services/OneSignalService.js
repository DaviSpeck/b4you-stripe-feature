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

async function sendNotification(basePayload, platform) {
    const payload = {
        ...basePayload,
        app_id:
            platform === "web"
                ? process.env.WEB_ONESIGNAL_APP_ID
                : process.env.APP_ONESIGNAL_APP_ID,
    };

    try {
        const client = getOneSignalClient(platform);
        const resp = await client.post("/notifications", payload);
        return resp.data;
    } catch (err) {
        if (err.response) {
            console.error(
                "[OneSignalService] error status:",
                err.response.status,
                err.response.data
            );
            const e = new Error("OneSignal API returned an error");
            e.status = err.response.status;
            e.details = err.response.data;
            throw e;
        }
        if (err.request) {
            console.error("[OneSignalService] no response:", err.request);
            const e = new Error("No response from OneSignal API");
            e.status = 504;
            throw e;
        }
        console.error("[OneSignalService] request error:", err.message);
        const e = new Error("Error building request to OneSignal API");
        e.status = 500;
        throw e;
    }
}

/**
 * Busca as últimas notificações (até 50 por chamada) do OneSignal
 */
async function fetchNotifications({ limit = 50, offset } = {}) {
    const params = { app_id: process.env.WEB_ONESIGNAL_APP_ID, limit };
    if (offset) params.offset = offset;
    const client = getOneSignalClient();
    const resp = await client.get('/notifications', { params });
    return resp.data;
}

module.exports = { sendNotification, fetchNotifications };
