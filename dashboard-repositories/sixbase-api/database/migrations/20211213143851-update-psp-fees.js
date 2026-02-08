module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.addColumn('psp_fees', 'fee_variable_card', {
        type: Sequelize.JSON,
      }),
      queryInterface.addColumn('psp_fees', 'fee_fixed_card', {
        type: Sequelize.DECIMAL(10, 2),
      }),
    ]);
  },

  down: async (queryInterface) => {
    await Promise.all([
      queryInterface.removeColumn('psp_fees', 'fee_variable_card'),
      queryInterface.removeColumn('psp_fees', 'fee_fixed_card'),
    ]);
  },
};
