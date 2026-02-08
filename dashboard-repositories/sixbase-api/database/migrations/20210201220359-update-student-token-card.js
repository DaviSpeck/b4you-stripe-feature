'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('students', 'number_token', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('students', 'credit_card', {
        type: Sequelize.JSON,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('students', 'number_token'),
      queryInterface.removeColumn('students', 'credit_card'),
    ]);
  },
};
