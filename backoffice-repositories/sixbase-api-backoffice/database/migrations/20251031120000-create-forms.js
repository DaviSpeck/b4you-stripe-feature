'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('forms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      form_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('forms', ['form_type', 'is_active'], {
      name: 'forms_form_type_is_active_idx',
    });
    await queryInterface.addIndex('forms', ['updated_at'], {
      name: 'forms_updated_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('forms', 'forms_form_type_is_active_idx');
    await queryInterface.removeIndex('forms', 'forms_updated_at_idx');
    await queryInterface.dropTable('forms');
  },
};
