const moment = require('moment-timezone');
const { dateHelperTZ } = require('./date-tz');

const DEFAULT_TZ = process.env.TZ || 'America/Sao_Paulo';

/**
 * Gera range atual + range anterior baseado em um array de 2 datas
 *
 * Exemplo:
 *  Input: [2025-02-01, 2025-02-10]
 *  Output:
 *    start = 2025-02-01
 *    end   = 2025-02-10
 *    prevStart = 2025-01-22
 *    prevEnd   = 2025-01-31
 */
function buildDateRangePayload([start, end], tz = DEFAULT_TZ) {
    try {
        if (!start || !end) return null;

        // Normaliza com timezone
        const startMoment = moment.tz(start, tz).startOf('day');
        const endMoment = moment.tz(end, tz).endOf('day');

        if (!startMoment.isValid() || !endMoment.isValid()) return null;

        // Duração do período atual
        const diffDays = endMoment.diff(startMoment, 'days') + 1;

        // Range anterior com mesmo tamanho
        const prevEnd = startMoment.clone().subtract(1, 'day').endOf('day');
        const prevStart = prevEnd.clone().subtract(diffDays - 1, 'days').startOf('day');

        return {
            start: startMoment,
            end: endMoment,
            prevStart,
            prevEnd,
            diffDays,
        };
    } catch (error) {
        console.error('[buildDateRangePayload] Error:', error);
        return null;
    }
}

module.exports = {
    buildDateRangePayload,
};