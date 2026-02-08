module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('balance_history', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_transaction: {
        type: Sequelize.BIGINT,
      },
      operation: {
        type: Sequelize.STRING,
      },
      old_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      new_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('balance_history'),
};
