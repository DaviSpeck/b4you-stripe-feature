import moment from 'moment';

import { getRankingResult } from './getRankingResult.mjs';
import { LeaderboardWinners } from '../database/models/LeaderboardWinners.mjs';
import { LEADERBOARD_START_DATE } from '../config/constants.mjs';
import logger from '../logger.mjs';

/**
 * Fecha o leaderboard (weekly | monthly)
 * - Calcula TOP 1
 * - Garante idempotência
 * - Persiste vencedor
 */
export async function closeLeaderboard({ scope, sequelize }) {
    const ranking = await getRankingResult({ scope, sequelize });
    const winner = ranking?.top10?.[0];

    if (!winner) {
        logger.info('No winner found', { scope });
        return;
    }

    const periodStart = moment(ranking.period.startDate);

    if (
        LEADERBOARD_START_DATE &&
        periodStart.isBefore(moment(LEADERBOARD_START_DATE))
    ) {
        logger.info('Period before LEADERBOARD_START_DATE, skipping', {
            scope,
            periodStart: periodStart.format('YYYY-MM-DD'),
        });
        return;
    }

    const period_year = periodStart.year();
    const period_value =
        scope === 'weekly'
            ? periodStart.isoWeek()
            : periodStart.month() + 1;

    const exists = await LeaderboardWinners.findOne({
        where: {
            scope,
            period_year,
            period_value,
        },
    });

    if (exists) {
        logger.info('Leaderboard already closed', {
            scope,
            period_year,
            period_value,
        });
        return;
    }

    if (process.env.LEADERBOARD_DRY_RUN === 'true') {
        logger.info('[DRY-RUN] Winner detected, not persisted', {
            scope,
            user_id: winner.userId,
            revenue: winner.revenue,
            period_year,
            period_value,
        });
        return;
    }

    await LeaderboardWinners.create({
        user_id: winner.userId,
        scope,
        period_year,
        period_value,
        revenue: winner.revenue,
    });

    logger.info('Leaderboard winner saved', {
        scope,
        user_id: winner.userId,
        period_year,
        period_value,
        revenue: winner.revenue,
    });
}