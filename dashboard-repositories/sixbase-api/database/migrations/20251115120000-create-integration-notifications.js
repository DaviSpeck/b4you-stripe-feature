module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('integration_notifications', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      id_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '1=webhook, 2=bling, 3=notazz, 4=reembolso, 5=shopify',
      },
      id_sale: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      id_sale_item: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      params: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      read: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
    await queryInterface.addIndex('integration_notifications', ['id_user']);
    await queryInterface.addIndex('integration_notifications', ['id_type']);
    await queryInterface.addIndex('integration_notifications', ['id_sale']);
    await queryInterface.addIndex('integration_notifications', [
      'id_sale_item',
    ]);
    await queryInterface.addIndex('integration_notifications', ['id_product']);
    await queryInterface.addIndex('integration_notifications', ['read']);
    await queryInterface.addIndex('integration_notifications', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('integration_notifications');
  },
};
