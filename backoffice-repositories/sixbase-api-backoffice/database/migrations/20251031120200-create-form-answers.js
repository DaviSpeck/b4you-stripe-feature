'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('form_answers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      id_form: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'forms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      key: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex(
      'form_answers',
      ['id_user', 'id_form', 'key'],
      {
        name: 'form_answers_user_form_key_idx',
      },
    );
    await queryInterface.addIndex('form_answers', ['id_form'], {
      name: 'form_answers_id_form_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'form_answers',
      'form_answers_user_form_key_idx',
    );
    await queryInterface.removeIndex(
      'form_answers',
      'form_answers_id_form_idx',
    );
    await queryInterface.dropTable('form_answers');
  },
};
