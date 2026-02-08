import { Op, QueryTypes } from 'sequelize';
import moment from 'moment';

import DateHelper from '../../utils/helpers/date.mjs';
import {
    DATABASE_DATE,
    DATABASE_DATE_WITHOUT_TIME,
} from '../../types/dateTypes.mjs';

import { LeaderboardWinners } from '../models/LeaderboardWinners.mjs';

/* =======================
 * Constantes
 * ======================= */

const PAID_STATUS = 2;
const LEADERBOARD_START_DATE = null;
const DEFAULT_ALL_TIME_MONTHS = 6;
const MAX_PAGE_SIZE = 50;

/* =======================
 * Helpers de data
 * ======================= */

const getLeaderboardStartDate = () => {
    if (!LEADERBOARD_START_DATE) return null;
    return DateHelper(LEADERBOARD_START_DATE).format(
        DATABASE_DATE_WITHOUT_TIME,
    );
};

const getUsableStartDate = (periodStart) => {
    const start = getLeaderboardStartDate();
    if (!start) return periodStart;
    if (start > periodStart) return start;
    return periodStart;
};

const buildPeriod = (start, end) => ({
    startDate: start.clone().startOf('day').add(3, 'hour').format(DATABASE_DATE),
    endDate: end.clone().endOf('day').add(3, 'hour').format(DATABASE_DATE),
    startDateOnly: start.clone().format(DATABASE_DATE_WITHOUT_TIME),
    endDateOnly: end.clone().format(DATABASE_DATE_WITHOUT_TIME),
});

const getWeeklyPeriod = () => {
    const now = moment().utcOffset(-3);
    return buildPeriod(
        now.clone().startOf('isoWeek'),
        now.clone().endOf('isoWeek'),
    );
};

const getMonthlyPeriod = () => {
    const now = moment().utcOffset(-3);
    return buildPeriod(
        now.clone().startOf('month'),
        now.clone().endOf('month'),
    );
};

const getAllTimePeriod = () =>
    buildPeriod(
        moment().utcOffset(-3).subtract(DEFAULT_ALL_TIME_MONTHS, 'months'),
        moment().utcOffset(-3),
    );

const getCustomPeriod = (start, end) =>
    buildPeriod(
        moment(start).utcOffset(-3),
        moment(end).utcOffset(-3),
    );

/* =======================
 * Winners excluídos
 * ======================= */

const getExcludedWinners = async (scopes) => {
    if (!scopes || !scopes.length) return [];

    const rows = await LeaderboardWinners.findAll({
        where: { scope: { [Op.in]: scopes } },
        attributes: ['user_id'],
        raw: true,
    });

    return rows.map((r) => r.user_id);
};

/* =======================
 * Executor do ranking
 * ======================= */

const executeRanking = async ({
    sequelize,
    id_user,
    page = 0,
    size = 10,
    period,
    excludedScopes,
    isAllTime = false,
}) => {
    const safePage = Math.max(0, Number(page) || 0);
    const safeSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(size) || 10));

    if (isAllTime) {
        return {
            top10: [],
            results: [],
            me: null,
            pagination: {},
            period: {
                startDate: period.startDate,
                endDate: period.endDate,
            },
        };
    }

    const excludedUserIds = await getExcludedWinners(excludedScopes);
    const excludedUserIdsClause = excludedUserIds.length
        ? 'AND u.id NOT IN (:excludedUserIds)'
        : '';

    const startDate = getUsableStartDate(period.startDateOnly);
    const endDate = period.endDateOnly;
    const offset = safePage * safeSize;

    const aggregateSQL = `
        SELECT
        u.id AS id_user,
        ANY_VALUE(u.full_name) AS full_name,
        ANY_VALUE(u.profile_picture) AS profile_picture,
        ANY_VALUE(u.created_at) AS created_at,
        SUM(c.amount) AS revenue,
        COUNT(DISTINCT c.id_sale_item) AS sales_count
        FROM commissions c
        JOIN sales_items si ON si.id = c.id_sale_item
        JOIN users u ON u.id = c.id_user
        JOIN (
        SELECT DISTINCT id_user
        FROM form_user_profiles
        WHERE form_type = 2
        ) creators ON creators.id_user = u.id
        WHERE
        si.id_status = :paidStatus
        AND si.paid_at BETWEEN :startDate AND :endDate
        ${excludedUserIdsClause}
        GROUP BY u.id
        HAVING revenue > 0
        ORDER BY
        revenue DESC,
        sales_count DESC,
        created_at ASC
    `;

    const [top10, results] = await Promise.all([
        sequelize.query(`${aggregateSQL} LIMIT 10`, {
            type: QueryTypes.SELECT,
            replacements: {
                startDate,
                endDate,
                paidStatus: PAID_STATUS,
                excludedUserIds,
            },
        }),
        sequelize.query(`${aggregateSQL} LIMIT :limit OFFSET :offset`, {
            type: QueryTypes.SELECT,
            replacements: {
                startDate,
                endDate,
                paidStatus: PAID_STATUS,
                excludedUserIds,
                limit: safeSize,
                offset,
            },
        }),
    ]);

    const mapRow = (u, position) => ({
        userId: u.id_user,
        name: u.full_name,
        avatarUrl: u.profile_picture,
        revenue: Number(u.revenue),
        salesCount: Number(u.sales_count),
        position,
        isCurrentUser: u.id_user === id_user,
    });

    return {
        top10: top10.map((u, i) => mapRow(u, i + 1)),
        results: results.map((u, i) => mapRow(u, offset + i + 1)),
        me: null,
        pagination: {
            page: safePage,
            limit: safeSize,
            total: null,
            pages: null,
        },
        period: {
            startDate: period.startDate,
            endDate: period.endDate,
        },
    };
};

/* =======================
 * Exports públicos
 * ======================= */

export const findWeeklyRankings = (sequelize, params) =>
    executeRanking({
        sequelize,
        ...params,
        period: getWeeklyPeriod(),
        excludedScopes: ['weekly', 'monthly'],
        isAllTime: false,
    });

export const findMonthlyRankings = (sequelize, params) =>
    executeRanking({
        sequelize,
        ...params,
        period: getMonthlyPeriod(),
        excludedScopes: ['weekly', 'monthly'],
        isAllTime: false,
    });

export const findAllTimeRankings = (sequelize, params) =>
    executeRanking({
        sequelize,
        ...params,
        period: getAllTimePeriod(),
        excludedScopes: [],
        isAllTime: true,
    });

export const findCustomRankings = ({ startDate, endDate, ...rest }) =>
    executeRanking({
        ...rest,
        period: getCustomPeriod(startDate, endDate),
        excludedScopes: [],
        isAllTime: false,
    });