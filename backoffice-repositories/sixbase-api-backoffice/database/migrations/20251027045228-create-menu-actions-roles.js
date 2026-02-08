'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_actions_roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      menu_action_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'menu_actions',
          key: 'id'
        },
        onUpdate: 'RESTRICT',
        onDelete: 'CASCADE'
      },
      role_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'backoffice_roles',
          key: 'id'
        },
        onUpdate: 'RESTRICT',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('menu_actions_roles', ['menu_action_id', 'role_id'], {
      unique: true,
      name: 'menu_actions_roles_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('menu_actions_roles');
  }
};