'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('students', 'document_type', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      queryInterface.addColumn('students', 'document_number', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      queryInterface.addColumn('students', 'whatsapp', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('students', 'document_type'),
      queryInterface.removeColumn('students', 'document_number'),
      queryInterface.removeColumn('students', 'whatsapp'),
    ]);
  },
};
