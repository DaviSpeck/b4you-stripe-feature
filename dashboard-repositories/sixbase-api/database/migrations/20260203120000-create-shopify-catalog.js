module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shopify_catalog', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      id_shop_integration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'shop_integrations',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },

      id_b4you_product: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'products', key: 'id' },
        onDelete: 'SET NULL',
      },

      id_b4you_offer: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'product_offer', key: 'id' },
        onDelete: 'SET NULL',
      },

      shopify_product_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      shopify_variant_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      sku: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      handle: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      product_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      variant_title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      full_title: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      compare_at_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },

      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'BRL',
      },

      inventory_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      vendor: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      product_type: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      tags: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      options: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      images: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      weight_grams: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },

      requires_shipping: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      raw_cart_item: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Last raw cart item data from Shopify'
      },

      times_seen: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Number of times seen in carts',
      },

      times_purchased: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of times purchased via B4You',
      },

      total_quantity_sold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total quantity sold via B4You',
      },

      total_revenue: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total revenue generated via B4You',
      },

      first_seen_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      last_seen_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      last_purchased_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      synced_at: {
        type: Sequelize.DATE,
        allowNull: true,
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
    });

    await queryInterface.addIndex(
      'shopify_catalog',
      ['id_shop_integration', 'shopify_variant_id', 'is_active'],
      {
        unique: true,
        name: 'uniq_shop_variant_active',
      }
    );

    await queryInterface.addIndex(
      'shopify_catalog',
      ['id_shop_integration', 'shopify_product_id'],
      { name: 'idx_shop_product' }
    );

    await queryInterface.addIndex(
      'shopify_catalog',
      ['id_shop_integration', 'sku'],
      { name: 'idx_shop_sku' }
    );

    await queryInterface.addIndex(
      'shopify_catalog',
      ['id_shop_integration', 'vendor'],
      { name: 'idx_shop_vendor' }
    );

    await queryInterface.addIndex(
      'shopify_catalog',
      ['id_shop_integration', 'product_type'],
      { name: 'idx_shop_type' }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('shopify_catalog');
  },
};