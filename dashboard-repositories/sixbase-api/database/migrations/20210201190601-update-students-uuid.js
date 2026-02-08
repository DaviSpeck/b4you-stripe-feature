'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('students', 'uuid', {
      type: Sequelize.UUID,
      unique: true,
      defaultValue: Sequelize.UUIDv4,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('students', 'uuid');
  },
};
