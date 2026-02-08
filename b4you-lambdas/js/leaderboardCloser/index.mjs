import { createSequelize } from './database/connection.mjs';
import { initModels } from './database/initModels.mjs';
import { closeLeaderboard } from './useCases/closeLeaderboard.mjs';
import logger from './logger.mjs';

export const handler = async (event) => {
    const scope = event?.scope;

    if (!['weekly', 'monthly'].includes(scope)) {
        logger.warn('Invalid scope received', event);
        return;
    }

    const sequelize = createSequelize();
    initModels(sequelize);

    try {
        await closeLeaderboard({ scope, sequelize });
        logger.info('Leaderboard closed successfully', { scope });
    } catch (err) {
        logger.error('Error closing leaderboard', {
            scope,
            message: err.message,
            stack: err.stack,
        });
        throw err;
    } finally {
        await sequelize.close();
    }
};