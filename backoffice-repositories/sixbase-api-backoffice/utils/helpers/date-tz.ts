const moment = require('moment-timezone');

const FRIDAY = 5;
const SATURDAY = 6;
const DEFAULT_TZ = process.env.TZ || 'America/Sao_Paulo';

/**
 * Helper de datas com timezone fixo (UTC−3 por padrão: America/Sao_Paulo)
 */
function dateHelperTZ(date = new Date(), tz = DEFAULT_TZ) {
    const base = moment.tz(moment(date).isValid() ? date : new Date(), tz);

    // Ajusta UTC→UTC−3 se necessário
    if (base.utcOffset() === 0) base.add(3, 'hours');

    return {
        add: (amount, unit) => base.clone().add(amount, unit),
        subtract: (amount, unit) => base.clone().subtract(amount, unit),
        diff: (dateToCompare, unit) => base.diff(moment(dateToCompare).tz(tz), unit),
        format: (format = 'YYYY-MM-DD HH:mm:ss') => base.clone().format(format),
        fromUTC: (format = 'YYYY-MM-DD HH:mm:ss') => moment.utc(base).tz(tz).format(format),
        toUnix: () => base.valueOf(),
        now: () => moment().tz(tz),
        startOf: (unit) => base.clone().startOf(unit),
        endOf: (unit) => base.clone().endOf(unit),
        isValid: () => base.isValid(),
        isBefore: (d) => base.isBefore(moment(d).tz(tz)),
        isAfter: (d) => base.isAfter(moment(d).tz(tz)),
        isSame: (d) => base.isSame(moment(d).tz(tz)),
        utcOffset: (offsetMinutes) => base.clone().utcOffset(offsetMinutes),
        toUTC: () => base.clone().utc(),
        nextBusinessDate: () => {
            const weekDay = base.day();
            if (weekDay === FRIDAY) return base.clone().add(3, 'days');
            if (weekDay === SATURDAY) return base.clone().add(2, 'days');
            return base.clone().add(1, 'days');
        },
        timezone: () => tz,
    };
}

/**
 * Formata uma data para SQL no fuso horário local (UTC−3)
 */
function formatDate(date, isEnd = false) {
    const tz = process.env.TZ || 'America/Sao_Paulo';
    const base = dateHelperTZ(date, tz)[isEnd ? 'endOf' : 'startOf']('day').add(3, 'hours');
    return base.format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Gera parâmetros de período (`startDate`, `endDate`)
 */
function getPeriodParams(start_date, end_date, extra = {}) {
    return {
        startDate: formatDate(start_date, false),
        endDate: formatDate(end_date, true),
        ...extra,
    };
}

module.exports = {
    dateHelperTZ,
    formatDate,
    getPeriodParams,
};