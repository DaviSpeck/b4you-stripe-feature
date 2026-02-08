'use strict';

const TABLE = 'backoffice_notes';

const typeMap = {
  administrative: 1,
  commercial: 2,
};

const followupStatusMap = {
  in_progress: 1,
  done: 2,
  awaiting_producer: 3,
  awaiting_internal: 4,
  resolved: 5,
  left_platform: 6,
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {

      // 1. Atualizar column type (string → int)
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET type = CASE
          WHEN type = 'administrative' THEN ${typeMap.administrative}
          WHEN type = 'commercial' THEN ${typeMap.commercial}
          ELSE type
        END`,
        { transaction }
      );

      // 2. Atualizar followup_status (string → int)
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET followup_status = CASE
          WHEN followup_status = 'in_progress' THEN ${followupStatusMap.in_progress}
          WHEN followup_status = 'done' THEN ${followupStatusMap.done}
          WHEN followup_status = 'awaiting_producer' THEN ${followupStatusMap.awaiting_producer}
          WHEN followup_status = 'awaiting_internal' THEN ${followupStatusMap.awaiting_internal}
          WHEN followup_status = 'resolved' THEN ${followupStatusMap.resolved}
          WHEN followup_status = 'left_platform' THEN ${followupStatusMap.left_platform}
          ELSE followup_status
        END`,
        { transaction }
      );

      // 3. Garantir que type nunca seja NULL antes do NOT NULL
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET type = ${typeMap.administrative} WHERE type IS NULL`,
        { transaction }
      );

      // 4. Alterar coluna type → INT NOT NULL DEFAULT 1
      await queryInterface.changeColumn(
        TABLE,
        'type',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: typeMap.administrative,
        },
        { transaction }
      );

      // 5. Alterar coluna followup_status → INT NULL
      await queryInterface.changeColumn(
        TABLE,
        'followup_status',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: null,
        },
        { transaction }
      );

      // 6. Ajustar colunas de texto
      await queryInterface.changeColumn(
        TABLE,
        'next_action',
        {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        TABLE,
        'summary',
        {
          type: Sequelize.STRING(800),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        TABLE,
        'pending_points',
        {
          type: Sequelize.STRING(800),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        TABLE,
        'additional_notes',
        {
          type: Sequelize.STRING(800),
          allowNull: true,
        },
        { transaction }
      );

    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {

      // Reverter type números → strings
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET type = CASE
          WHEN type = ${typeMap.administrative} THEN 'administrative'
          WHEN type = ${typeMap.commercial} THEN 'commercial'
          ELSE type
        END`,
        { transaction }
      );

      // Reverter followup_status números → strings
      await queryInterface.sequelize.query(
        `UPDATE ${TABLE} SET followup_status = CASE
          WHEN followup_status = ${followupStatusMap.in_progress} THEN 'in_progress'
          WHEN followup_status = ${followupStatusMap.done} THEN 'done'
          WHEN followup_status = ${followupStatusMap.awaiting_producer} THEN 'awaiting_producer'
          WHEN followup_status = ${followupStatusMap.awaiting_internal} THEN 'awaiting_internal'
          WHEN followup_status = ${followupStatusMap.resolved} THEN 'resolved'
          WHEN followup_status = ${followupStatusMap.left_platform} THEN 'left_platform'
          ELSE followup_status
        END`,
        { transaction }
      );

      // Reverter colunas aos tipos ENUM originais
      await queryInterface.changeColumn(
        TABLE,
        'type',
        {
          type: Sequelize.ENUM('administrative', 'commercial'),
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        TABLE,
        'followup_status',
        {
          type: Sequelize.ENUM(
            'in_progress',
            'done',
            'awaiting_producer',
            'awaiting_internal',
            'resolved',
            'left_platform'
          ),
          allowNull: true,
        },
        { transaction }
      );

      // Reverter tamanhos das colunas de texto
      await queryInterface.changeColumn(
        TABLE,
        'next_action',
        { type: Sequelize.STRING(255), allowNull: true },
        { transaction }
      );

      await queryInterface.changeColumn(
        TABLE,
        'summary',
        { type: Sequelize.STRING(255), allowNull: true },
        { transaction }
      );

      await queryInterface.changeColumn(
        TABLE,
        'pending_points',
        { type: Sequelize.STRING(255), allowNull: true },
        { transaction }
      );

      await queryInterface.changeColumn(
        TABLE,
        'additional_notes',
        { type: Sequelize.STRING(255), allowNull: true },
        { transaction }
      );
    });
  },
};
