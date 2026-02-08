

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('short_links', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      uuid: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.literal('(UUID())'),
      },

      short_id: {
        type: Sequelize.STRING(16),
        allowNull: false,
        unique: true,
      },

      type: {
        type: Sequelize.ENUM('PAGE', 'OFFER'),
        allowNull: false,
      },

      page_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },

      offer_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
      },

      /**
       * Novo formato definitivo
       * owner_type: 1=producer, 2=coproducer, 3=affiliate, 4=global
       * owner_uuid:
       *   - producer/coproducer → users.uuid
       *   - affiliate → affiliates.uuid
       *   - global → null
       */
      owner_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '1=producer, 2=coproducer, 3=affiliate, 4=global',
      },

      owner_uuid: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        comment: 'UUID relativo ao owner_type',
      },

      redirect_url: {
        type: Sequelize.STRING(2048),
        allowNull: false,
      },

      clicks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Índice principal (único)
    await queryInterface.addIndex('short_links', {
      name: 'short_links_unique_idx',
      unique: true,
      fields: [
        'type',
        'owner_type',
        'owner_uuid',
        'page_uuid',
        'offer_uuid',
      ],
    });

    // Índice só para short_id
    await queryInterface.addIndex('short_links', {
      name: 'short_links_short_id_idx',
      fields: ['short_id'],
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('short_links');
  },
};