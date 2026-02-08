import { firstSignup } from "../useCases/firstSignup.mjs";
import { firstSale } from "../useCases/firstSale.mjs";
import { getEventConfig } from "../useCases/getEventConfig.mjs";

function sleep(seconds = 0) {
    if (!seconds || seconds <= 0) return Promise.resolve();
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export async function routeSqsEvent(message, botmakerEvents, sequelize, models) {
    const { event, id_user } = message;

    const config = await getEventConfig(models, event);

    if (!config) {
        return {
            skipped: true,
            reason: "event disabled or not found",
            event,
        };
    }

    let payload;

    switch (event) {
        case "first_signup":
            payload = await firstSignup(sequelize, models, { id_user });
            break;

        case "first_sale":
            payload = await firstSale(sequelize, models, { id_user });
            break;

        default:
            throw new Error(`Unknown SQS event type: ${event}`);
    }

    payload.__templateKey = config.template_key;

    await sleep(config.delay_seconds);

    return botmakerEvents.emit(event, payload);
}