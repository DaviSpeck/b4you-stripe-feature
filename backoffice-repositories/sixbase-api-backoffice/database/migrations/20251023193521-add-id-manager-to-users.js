'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'id_manager', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users_backoffice',
        key: 'id',
      },
      onUpdate: 'RESTRICT',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'id_manager');
  },
};