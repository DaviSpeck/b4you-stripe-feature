'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('sales', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_student: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_upsell: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      id_affiliate: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      affiliate_percentage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      id_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      psp_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
    return queryInterface.dropTable('sales');
  },
};
