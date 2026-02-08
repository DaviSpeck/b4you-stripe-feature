'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('coproduction_invites', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id_productor: {
        type: Sequelize.INTEGER,
      },
      id_coproducer: {
        type: Sequelize.INTEGER,
      },
      id_product: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.BOOLEAN,
      },
      commission_percentage: {
        type: Sequelize.DECIMAL(10, 2),
      },
      expires_at: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('coproduction_invites');
  },
};
