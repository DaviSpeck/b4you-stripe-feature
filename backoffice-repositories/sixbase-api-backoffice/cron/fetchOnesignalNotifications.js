const cron = require('node-cron');
const { pollAndSaveHistory } = require('../controllers/onesignalPoll');

cron.schedule('*/30 * * * *', async () => {
    console.info('[Cron][OneSignal Poll] iniciando polling…');
    try {
        await pollAndSaveHistory();
        console.info('[Cron][OneSignal Poll] concluído com sucesso');
    } catch (err) {
        console.error('[Cron][OneSignal Poll] erro:', err);
    }
});