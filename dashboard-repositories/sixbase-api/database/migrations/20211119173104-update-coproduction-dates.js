module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('coproductions', 'warning_one_day', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn('coproductions', 'warning_seven_days', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('coproductions', 'warning_one_day'),
      queryInterface.removeColumn('coproductions', 'warning_seven_days'),
    ]);
  },
};
