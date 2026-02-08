const DateHelper = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkDelete('withdrawals_settings_default', [
      { id: 1 },
    ]);
    await queryInterface.bulkInsert(
      'withdrawals_settings_default',
      [
        {
          free_month_withdrawal: 4,
          max_daily_withdrawal: 1,
          max_amount: 2000,
          min_amount: 5,
          fee_fixed: 5,
          fee_variable: 0,
          withheld_balance_percentage: 10,
          created_at: DateHelper().format(DATABASE_DATE),
        },
      ],
      {},
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('withdrawals_settings_default', [
      { id: 1 },
    ]);
    await queryInterface.bulkInsert(
      'withdrawals_settings_default',
      [
        {
          free_month_withdrawal: 4,
          max_daily_withdrawal: 1,
          max_amount: 2000,
          min_amount: 5,
          fee_fixed: 5,
          fee_variable: 0,
          created_at: DateHelper().format(DATABASE_DATE),
        },
      ],
      {},
    );
  },
};
