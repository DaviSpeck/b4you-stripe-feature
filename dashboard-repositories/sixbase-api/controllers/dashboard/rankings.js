const ApiError = require('../../error/ApiError');
const {
    findWeeklyRankings,
    findMonthlyRankings,
    findAllTimeRankings,
    findCustomRankings,
} = require('../../database/controllers/rankings');

const VALID_SCOPES = ['weekly', 'monthly', 'all-time', 'custom'];

/**
 * Rankings públicos — usuário é OPCIONAL
 */
const getWeeklyRankingsController = async (req, res, next) => {
    try {
        const { page = 0, size = 10, input } = req.query;
        const id_user = req.user?.id ?? null;

        const result = await findWeeklyRankings({
            id_user,
            page: parseInt(page, 10),
            size: parseInt(size, 10),
            input,
        });

        return res.status(200).json(result);
    } catch (error) {
        return next(
            ApiError.internalServerError(
                `Internal Server Error, GET: ${req.originalUrl}`,
                error,
            ),
        );
    }
};

const getMonthlyRankingsController = async (req, res, next) => {
    try {
        const { page = 0, size = 10, input } = req.query;
        const id_user = req.user?.id ?? null;

        const result = await findMonthlyRankings({
            id_user,
            page: parseInt(page, 10),
            size: parseInt(size, 10),
            input,
        });

        return res.status(200).json(result);
    } catch (error) {
        return next(
            ApiError.internalServerError(
                `Internal Server Error, GET: ${req.originalUrl}`,
                error,
            ),
        );
    }
};

const getAllTimeRankingsController = async (req, res, next) => {
    try {
        const { page = 0, size = 10, input } = req.query;
        const id_user = req.user?.id ?? null;

        const result = await findAllTimeRankings({
            id_user,
            page: parseInt(page, 10),
            size: parseInt(size, 10),
            input,
        });

        return res.status(200).json(result);
    } catch (error) {
        return next(
            ApiError.internalServerError(
                `Internal Server Error, GET: ${req.originalUrl}`,
                error,
            ),
        );
    }
};

const getCustomRankingsController = async (req, res, next) => {
    try {
        const { page = 0, size = 10, input, startDate, endDate } = req.query;
        const id_user = req.user?.id ?? null;

        if (!startDate || !endDate) {
            return next(
                ApiError.badRequest(
                    'Parâmetros obrigatórios: startDate e endDate (formato YYYY-MM-DD)',
                ),
            );
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return next(
                ApiError.badRequest(
                    'Formato de data inválido. Use YYYY-MM-DD (ex: 2025-01-01)',
                ),
            );
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
            return next(
                ApiError.badRequest(
                    'startDate não pode ser posterior a endDate',
                ),
            );
        }

        const result = await findCustomRankings({
            id_user,
            page: parseInt(page, 10),
            size: parseInt(size, 10),
            input,
            startDate,
            endDate,
        });

        return res.status(200).json(result);
    } catch (error) {
        return next(
            ApiError.internalServerError(
                `Internal Server Error, GET: ${req.originalUrl}`,
                error,
            ),
        );
    }
};

/**
 * /rankings/me — usuário OBRIGATÓRIO
 */
const getMeRankingsController = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return next(ApiError.unauthorized('Usuário não autenticado'));
        }

        const id_user = req.user.id;
        const { scope, startDate, endDate } = req.query;

        if (!scope) {
            return next(
                ApiError.badRequest(
                    'Parâmetro obrigatório: scope (weekly|monthly|all-time|custom)',
                ),
            );
        }

        if (!VALID_SCOPES.includes(scope)) {
            return next(
                ApiError.badRequest(
                    `Scope inválido. Use um dos seguintes: ${VALID_SCOPES.join(', ')}`,
                ),
            );
        }

        let result;

        switch (scope) {
            case 'weekly':
                result = await findWeeklyRankings({
                    id_user,
                    page: 0,
                    size: 1,
                    input: null,
                });
                break;

            case 'monthly':
                result = await findMonthlyRankings({
                    id_user,
                    page: 0,
                    size: 1,
                    input: null,
                });
                break;

            case 'all-time':
                result = await findAllTimeRankings({
                    id_user,
                    page: 0,
                    size: 1,
                    input: null,
                });
                break;

            case 'custom': {
                if (!startDate || !endDate) {
                    return next(
                        ApiError.badRequest(
                            'Para scope "custom", parâmetros obrigatórios: startDate e endDate (formato YYYY-MM-DD)',
                        ),
                    );
                }

                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
                    return next(
                        ApiError.badRequest(
                            'Formato de data inválido. Use YYYY-MM-DD (ex: 2025-01-01)',
                        ),
                    );
                }

                const start = new Date(startDate);
                const end = new Date(endDate);
                if (start > end) {
                    return next(
                        ApiError.badRequest(
                            'startDate não pode ser posterior a endDate',
                        ),
                    );
                }

                result = await findCustomRankings({
                    id_user,
                    page: 0,
                    size: 1,
                    input: null,
                    startDate,
                    endDate,
                });
                break;
            }

            default:
                return next(
                    ApiError.badRequest(
                        `Scope inválido. Use um dos seguintes: ${VALID_SCOPES.join(', ')}`,
                    ),
                );
        }

        return res.status(200).json({
            me: result.me,
            period: result.period,
        });
    } catch (error) {
        return next(
            ApiError.internalServerError(
                `Internal Server Error, GET: ${req.originalUrl}`,
                error,
            ),
        );
    }
};

module.exports = {
    getWeeklyRankingsController,
    getMonthlyRankingsController,
    getAllTimeRankingsController,
    getCustomRankingsController,
    getMeRankingsController,
};