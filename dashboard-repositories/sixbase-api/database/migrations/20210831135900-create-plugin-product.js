module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('plugins_products', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_product: {
        type: Sequelize.BIGINT,
      },
      id_plugin: {
        type: Sequelize.BIGINT,
      },
      id_rule: {
        type: Sequelize.BIGINT,
      },
      id_list: {
        type: Sequelize.BIGINT,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDv4,
      },
      insert_list: {
        type: Sequelize.BOOLEAN,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('plugins_products');
  },
};
