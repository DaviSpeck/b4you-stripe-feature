import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { createBotmakerEventsModule, setConfig } =
    require('./index');

let instance = null;

export function getBotmakerEventsModule() {
    if (!instance) {
        setConfig({
            botmaker: {
                accessToken: process.env.BOTMAKER_ACCESS_TOKEN,
                whatsappChannelId: process.env.BOTMAKER_WHATSAPP_CHANNEL_ID,
            },
            timezone: process.env.APP_TIMEZONE || 'America/Sao_Paulo',
            scheduler: { defaultHour: 9 },
        });

        instance = createBotmakerEventsModule();
    }

    return instance;
}