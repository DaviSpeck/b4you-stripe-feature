module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('taxes', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      tax_variable_percentage: {
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

  down: async (queryInterface) => queryInterface.dropTable('taxes'),
};
