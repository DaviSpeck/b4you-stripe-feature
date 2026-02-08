'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('affiliates', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_product: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      commission_percentage: {
        type: Sequelize.DECIMAL(10, 2),
      },
      active: {
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        type: Sequelize.BIGINT,
      },
      updated_at: {
        type: Sequelize.BIGINT,
      },
      deleted_at: {
        type: Sequelize.BIGINT,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable('affiliates');
  },
};
