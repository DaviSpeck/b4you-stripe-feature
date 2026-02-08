'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'reactivation_status', {
      type: Sequelize.ENUM('not_contacted', 'contacting', 'success'),
      allowNull: true,    // NULL em todos os registros atuais
      defaultValue: null, // sem valor default
    });
    await queryInterface.addIndex('users', ['reactivation_status'], {
      name: 'idx_users_reactivation_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', 'idx_users_reactivation_status');
    await queryInterface.removeColumn('users', 'reactivation_status');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_users_reactivation_status";'
    );
  }
};
