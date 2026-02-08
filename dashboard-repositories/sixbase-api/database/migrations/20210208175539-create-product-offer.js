'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('product_offer', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
      },
      uuid: {
        type: Sequelize.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDv4,
      },
      created_at: {
        type: Sequelize.BIGINT,
      },
      updated_at: {
        type: Sequelize.BIGINT,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('product_offer');
  },
};
