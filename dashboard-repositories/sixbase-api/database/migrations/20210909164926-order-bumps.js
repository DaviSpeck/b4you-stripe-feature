module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('order_bumps', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
      },
      id_offer: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(20, 2),
        allowNull: false,
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
    await queryInterface.dropTable('order_bumps');
  },
};
