const { Op } = require('sequelize');
const moment = require('moment');
const DateHelper = require('../../utils/helpers/date');
const { DATABASE_DATE, DATABASE_DATE_WITHOUT_TIME } = require('../../types/dateTypes');

const LeaderboardWinners = require('../models/LeaderboardWinners');
const database = require('../models');

const PAID_STATUS = 2;

const LEADERBOARD_START_DATE = null;
const DEFAULT_ALL_TIME_MONTHS = 6;
const MAX_PAGE_SIZE = 50;

const getLeaderboardStartDate = () => {
    if (!LEADERBOARD_START_DATE) return null;

    return DateHelper(LEADERBOARD_START_DATE).format(DATABASE_DATE_WITHOUT_TIME);
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
 * ALL-TIME MOCK
 * ======================= */

const buildFakeUser = (position) => ({
    userId: -position,
    name: `Creator Mock #${position}`,
    avatarUrl: 'https://via.placeholder.com/150?text=MOCK',
    revenue: 100000 - position * 1234,
    salesCount: 500 - position * 7,
    position,
    isCurrentUser: false,
    isMock: true,
});

const buildAllTimeMock = ({ id_user, page, size, period }) => {
    const start = page * size + 1;
    const end = start + size - 1;

    const results = [];
    for (let i = start; i <= end; i += 1) {
        results.push(buildFakeUser(i));
    }

    const top10 = [];
    for (let i = 1; i <= 10; i += 1) {
        top10.push(buildFakeUser(i));
    }

    const me = id_user
        ? {
            userId: id_user,
            name: 'Você (Mock)',
            avatarUrl: 'https://via.placeholder.com/150?text=YOU',
            revenue: 12345,
            salesCount: 67,
            position: 42,
            isCurrentUser: true,
            isMock: true,
        }
        : null;

    return {
        top10,
        results,
        me,
        pagination: {
            page,
            limit: size,
            total: 1000,
            pages: Math.ceil(1000 / size),
        },
        period: {
            startDate: period.startDate,
            endDate: period.endDate,
        },
    };
};

/* =======================
 * Executor
 * ======================= */

const executeRanking = async ({
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
        return buildAllTimeMock({
            id_user,
            page: safePage,
            size: safeSize,
            period,
        });
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
        database.sequelize.query(`${aggregateSQL} LIMIT 10`, {
            type: database.sequelize.QueryTypes.SELECT,
            replacements: {
                startDate,
                endDate,
                paidStatus: PAID_STATUS,
                excludedUserIds,
            },
        }),
        database.sequelize.query(`${aggregateSQL} LIMIT :limit OFFSET :offset`, {
            type: database.sequelize.QueryTypes.SELECT,
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

module.exports = {
    findWeeklyRankings: (params) =>
        executeRanking({
            ...params,
            period: getWeeklyPeriod(),
            excludedScopes: ['weekly', 'monthly'],
            isAllTime: false,
        }),

    findMonthlyRankings: (params) =>
        executeRanking({
            ...params,
            period: getMonthlyPeriod(),
            excludedScopes: ['weekly', 'monthly'],
            isAllTime: false,
        }),

    findAllTimeRankings: (params) =>
        executeRanking({
            ...params,
            period: getAllTimePeriod(),
            excludedScopes: [],
            isAllTime: true,
        }),

    findCustomRankings: ({ startDate, endDate, ...rest }) =>
        executeRanking({
            ...rest,
            period: getCustomPeriod(startDate, endDate),
            excludedScopes: [],
            isAllTime: false,
        }),
};