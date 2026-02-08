'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('menu_actions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      menu_item_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'menu_items',
          key: 'id'
        },
        onUpdate: 'RESTRICT',
        onDelete: 'CASCADE'
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('menu_actions', ['menu_item_id', 'key'], {
      unique: true,
      name: 'menu_actions_unique_key_per_menu'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('menu_actions');
  }
};
