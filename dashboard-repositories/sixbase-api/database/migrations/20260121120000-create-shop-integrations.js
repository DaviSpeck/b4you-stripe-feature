module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shop_integrations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      id_user: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      platform: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'shopify',
      },

      shop_domain: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      shop_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      // IMPORTANTE: preparado para criptografia futura
      access_token: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Encrypted Shopify Admin API access token',
      },

      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },

      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      config: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Store-specific configuration object',
      },

      id_product: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Auto-created container product for this shop',
      },

      id_default_offer: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'product_offer',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Default offer for the container product',
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('shop_integrations', ['id_user'], {
      name: 'idx_shop_integrations_user',
    });

    await queryInterface.addIndex('shop_integrations', ['shop_domain'], {
      unique: true,
      name: 'uniq_shop_integrations_domain',
    });

    await queryInterface.addIndex('shop_integrations', ['uuid'], {
      unique: true,
      name: 'uniq_shop_integrations_uuid',
    });

    await queryInterface.addIndex(
      'shop_integrations',
      ['shop_domain', 'active', 'deleted_at'],
      {
        name: 'idx_shop_domain_active_lookup',
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('shop_integrations');
  },
};