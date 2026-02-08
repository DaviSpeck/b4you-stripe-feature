'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'uuid', {
      type: Sequelize.UUID,
      unique: true,
      defaultValue: Sequelize.UUIDv4,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'uuid');
  },
};
