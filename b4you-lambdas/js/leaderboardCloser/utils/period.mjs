import moment from 'moment';

export function getWeeklyPeriod() {
    const now = moment().utcOffset(-3);
    return {
        startDate: now.clone().startOf('isoWeek'),
        endDate: now.clone().endOf('isoWeek'),
    };
}

export function getMonthlyPeriod() {
    const now = moment().utcOffset(-3);
    return {
        startDate: now.clone().startOf('month'),
        endDate: now.clone().endOf('month'),
    };
}

export function getPeriodMetadata(scope, periodStart) {
    return {
        period_year: periodStart.year(),
        period_value:
            scope === 'weekly'
                ? periodStart.isoWeek()
                : periodStart.month() + 1,
    };
}