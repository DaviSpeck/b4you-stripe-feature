'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('students', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      blocked: {
        type: Sequelize.BOOLEAN,
      },
      classroom_ids: {
        type: Sequelize.STRING,
      },
      unlimited: {
        type: Sequelize.BOOLEAN,
      },
      membership: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('students');
  },
};
