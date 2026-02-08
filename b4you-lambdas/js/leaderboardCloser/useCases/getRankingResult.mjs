import {
    findWeeklyRankings,
    findMonthlyRankings,
} from '../database/controllers/rankings.mjs';

export async function getRankingResult({ scope, sequelize }) {
    if (scope === 'weekly') {
        return findWeeklyRankings(sequelize, { page: 0, size: 1 });
    }

    if (scope === 'monthly') {
        return findMonthlyRankings(sequelize, { page: 0, size: 1 });
    }

    throw new Error('Invalid scope');
}