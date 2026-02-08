const DateHelper = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');

module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      'psp_fees',
      [
        {
          fee_variable_withdrawal: 0,
          fee_fixed_withdrawal: 2,
          fee_variable_card: JSON.stringify({
            1: 1,
            2: 2,
            3: 3,
            4: 4,
            5: 5,
            6: 6,
            7: 7,
            8: 8,
            9: 9,
            10: 10,
            11: 11,
            12: 12,
          }),
          fee_fixed_card: 1,
          fee_variable_pix: 1,
          fee_fixed_pix: 1,
          fee_variable_billet: 1,
          fee_fixed_billet: 1,
          created_at: DateHelper().format(DATABASE_DATE),
        },
      ],
      {},
    ),

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('psp_fees', [{ id: 1 }]);
  },
};
