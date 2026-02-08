module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('psp_fees', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      fee_variable_withdrawal: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
      },
      fee_fixed_withdrawal: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('psp_fees'),
};
