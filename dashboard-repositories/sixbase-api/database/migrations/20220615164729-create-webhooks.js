module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('webhooks', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      events: {
        type: Sequelize.STRING,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
      deleted_at: Sequelize.DATE,
    }),

  down: async (queryInterface) => queryInterface.dropTable('webhooks'),
};
