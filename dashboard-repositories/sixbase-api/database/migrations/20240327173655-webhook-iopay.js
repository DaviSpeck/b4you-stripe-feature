module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('webhooks_iopay', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      payload: {
        type: Sequelize.JSON,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('webhooks_iopay');
  },
};