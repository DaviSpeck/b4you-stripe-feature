const DateHelper = require('../../utils/helpers/date');
const { DATABASE_DATE } = require('../../types/dateTypes');

module.exports = {
  up: (queryInterface) =>
    queryInterface.bulkInsert(
      'taxes',
      [
        {
          tax_variable_percentage: 20,
          created_at: DateHelper().format(DATABASE_DATE),
        },
      ],
      {},
    ),

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('taxes', [{ id: 1 }]);
  },
};
