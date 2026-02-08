'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('backoffice_notes', 'type', {
      type: Sequelize.ENUM('commercial', 'administrative'),
      allowNull: true,
      defaultValue: null,
      comment: 'Tipo da nota: comercial ou administrativa'
    });

    await queryInterface.addColumn('backoffice_notes', 'summary', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Resumo curto do contato (notas comerciais)'
    });

    await queryInterface.addColumn('backoffice_notes', 'next_action', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Próxima ação combinada (notas comerciais)'
    });

    await queryInterface.addColumn('backoffice_notes', 'pending_points', {
      type: `${Sequelize.TEXT} CHARSET utf8 COLLATE utf8_unicode_ci`,
      allowNull: true,
      comment: 'Pontos pendentes (notas comerciais)'
    });

    await queryInterface.addColumn('backoffice_notes', 'additional_notes', {
      type: `${Sequelize.TEXT} CHARSET utf8 COLLATE utf8_unicode_ci`,
      allowNull: true,
      comment: 'Observações adicionais (notas comerciais)'
    });

    await queryInterface.addColumn('backoffice_notes', 'followup_status', {
      type: Sequelize.ENUM(
        'in_progress',
        'done',
        'awaiting_producer',
        'awaiting_internal',
        'resolved',
        'left_platform'
      ),
      allowNull: true,
      defaultValue: null,
      comment: 'Status do follow-up (notas comerciais)'
    });

    await queryInterface.addColumn('backoffice_notes', 'next_contact_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Data do próximo contato (notas comerciais)'
    });

    await queryInterface.addIndex('backoffice_notes', ['type', 'created_at'], {
      name: 'idx_backoffice_notes_type_created_at'
    });
    await queryInterface.addIndex('backoffice_notes', ['followup_status'], {
      name: 'idx_backoffice_notes_followup_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('backoffice_notes', 'idx_backoffice_notes_followup_status');
    await queryInterface.removeIndex('backoffice_notes', 'idx_backoffice_notes_type_created_at');

    await queryInterface.removeColumn('backoffice_notes', 'next_contact_at');
    await queryInterface.removeColumn('backoffice_notes', 'followup_status');
    await queryInterface.removeColumn('backoffice_notes', 'additional_notes');
    await queryInterface.removeColumn('backoffice_notes', 'pending_points');
    await queryInterface.removeColumn('backoffice_notes', 'next_action');
    await queryInterface.removeColumn('backoffice_notes', 'summary');
    await queryInterface.removeColumn('backoffice_notes', 'type');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_backoffice_notes_followup_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_backoffice_notes_type";');
  }
};
