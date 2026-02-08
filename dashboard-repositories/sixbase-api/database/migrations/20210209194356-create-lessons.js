'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('lessons', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      id_module: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.STRING,
      },
      duration: {
        type: Sequelize.INTEGER,
      },
      order: {
        type: Sequelize.INTEGER,
      },
      active: {
        type: Sequelize.BOOLEAN,
      },
      has_attachment: {
        type: Sequelize.BOOLEAN,
      },
      filename: {
        type: Sequelize.STRING,
      },
      url_video: {
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
    return queryInterface.dropTable('lessons');
  },
};
