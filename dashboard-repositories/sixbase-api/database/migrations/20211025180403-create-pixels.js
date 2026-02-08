module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('pixels', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_type: {
        type: Sequelize.BIGINT,
      },
      id_user: {
        type: Sequelize.BIGINT,
      },
      id_product: {
        type: Sequelize.BIGINT,
      },
      settings: {
        type: Sequelize.JSON,
      },
      is_affiliate: {
        type: Sequelize.BOOLEAN,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    }),

  down: async (queryInterface) => queryInterface.dropTable('pixels'),
};
