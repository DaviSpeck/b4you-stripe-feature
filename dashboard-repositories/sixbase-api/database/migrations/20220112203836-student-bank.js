module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('students', 'bank_code', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('students', 'account_agency', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('students', 'account_number', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('students', 'bank_code'),
      queryInterface.removeColumn('students', 'account_agency'),
      queryInterface.removeColumn('students', 'account_number'),
    ]);
  },
};
