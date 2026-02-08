module.exports = {
  up: async (queryInterface) => {
    await Promise.all([
      queryInterface.dropTable('sales_status'),
      queryInterface.dropTable('transactions_status'),
      queryInterface.dropTable('charges_status'),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.createTable('sales_status', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
        },
      }),
      queryInterface.createTable('transactions_status', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
        },
      }),
      queryInterface.createTable('charges_status', {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      }),
    ]);
  },
};
