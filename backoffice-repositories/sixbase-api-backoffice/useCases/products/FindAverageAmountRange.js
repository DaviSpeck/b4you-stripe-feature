const dateHelper = require('../../utils/helpers/date');

module.exports = class FindAverageAmountRange {
    constructor(SalesItemsRepository) {
        this.SalesItemsRepository = SalesItemsRepository;
    }

    async execute({ start_date, end_date }) {
        const results = await this.SalesItemsRepository.averageAmountRangeByDay(start_date, end_date);

        const totalsByDay = {};
        for (const { date, total } of results) {
            const key = dateHelper(date).format('YYYY-MM-DD');
            totalsByDay[key] = (totalsByDay[key] || 0) + Number(total || 0);
        }

        const fullDays = [];
        const cursor = dateHelper(start_date).startOf('day');
        const endCursor = dateHelper(end_date).endOf('day');

        while (!cursor.isAfter(endCursor)) {
            const key = cursor.format('YYYY-MM-DD');
            fullDays.push({
                date: key,
                total: totalsByDay[key] || 0,
            });
            cursor.add(1, 'day');
        }

        return { data: fullDays };
    }
};