'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('study_history', {
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
      id_module: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_lesson: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      time: {
        type: Sequelize.INTEGER,
      },
      done: {
        type: Sequelize.BOOLEAN,
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
    return queryInterface.dropTable('study_history');
  },
};
