module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('payouts', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      id_user_requested: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      id_transaction: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      bank_address: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    }),

  down: async (queryInterface) => queryInterface.dropTable('payouts'),
};
