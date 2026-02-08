'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('form_user_profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },

      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      id_form: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'forms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      form_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      form_version: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      answers: {
        type: Sequelize.JSON,
        allowNull: false,
      },

      summary: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      completed_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Índices
    await queryInterface.addIndex('form_user_profiles', ['id_user'], {
      name: 'form_user_profiles_id_user_idx',
    });

    await queryInterface.addIndex('form_user_profiles', ['form_type'], {
      name: 'form_user_profiles_form_type_idx',
    });

    await queryInterface.addIndex('form_user_profiles', ['form_version'], {
      name: 'form_user_profiles_form_version_idx',
    });

    await queryInterface.addIndex(
      'form_user_profiles',
      ['id_user', 'form_type'],
      { name: 'form_user_profiles_user_form_type_idx' }
    );

    await queryInterface.addIndex(
      'form_user_profiles',
      ['id_user', 'form_type', 'form_version'],
      { name: 'form_user_profiles_user_form_type_version_idx' }
    );
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'form_user_profiles',
      'form_user_profiles_id_user_idx'
    );
    await queryInterface.removeIndex(
      'form_user_profiles',
      'form_user_profiles_form_type_idx'
    );
    await queryInterface.removeIndex(
      'form_user_profiles',
      'form_user_profiles_form_version_idx'
    );
    await queryInterface.removeIndex(
      'form_user_profiles',
      'form_user_profiles_user_form_type_idx'
    );
    await queryInterface.removeIndex(
      'form_user_profiles',
      'form_user_profiles_user_form_type_version_idx'
    );

    await queryInterface.dropTable('form_user_profiles');
  },
};