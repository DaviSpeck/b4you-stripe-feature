module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sales_items_plugins', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_sale_item: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_bling: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      id_tiny: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      id_shopify: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      id_notazz: {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      },
      body: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      },
      response: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
      },
      updated_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('sales_items_plugins');
  },
};
