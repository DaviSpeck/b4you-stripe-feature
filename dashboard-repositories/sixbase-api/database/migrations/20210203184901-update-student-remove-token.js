'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('students', 'number_token');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('students', 'number_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
