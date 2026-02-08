const Sequelize = require('sequelize');

class Shopify_catalog extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_shop_integration: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        id_b4you_product: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_b4you_offer: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        shopify_product_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        shopify_variant_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        sku: { type: Sequelize.STRING(255), allowNull: true },
        handle: { type: Sequelize.STRING(255), allowNull: true },
        product_title: { type: Sequelize.STRING(255), allowNull: true },
        variant_title: { type: Sequelize.STRING(255), allowNull: true },
        full_title: { type: Sequelize.STRING(500), allowNull: true },
        price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        compare_at_price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
        currency: {
          type: Sequelize.STRING(3),
          allowNull: true,
          defaultValue: 'BRL',
        },
        inventory_quantity: { type: Sequelize.INTEGER, allowNull: true },
        vendor: { type: Sequelize.STRING(255), allowNull: true },
        product_type: { type: Sequelize.STRING(255), allowNull: true },
        tags: { type: Sequelize.TEXT, allowNull: true },
        options: { type: Sequelize.JSON, allowNull: true },
        image_url: { type: Sequelize.TEXT, allowNull: true },
        images: { type: Sequelize.JSON, allowNull: true },
        weight_grams: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0,
        },
        requires_shipping: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: true,
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        raw_cart_item: { type: Sequelize.JSON, allowNull: true },
        times_seen: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        times_purchased: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        total_quantity_sold: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        total_revenue: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0,
        },
        first_seen_at: { type: Sequelize.DATE, allowNull: false },
        last_seen_at: { type: Sequelize.DATE, allowNull: false },
        last_purchased_at: { type: Sequelize.DATE, allowNull: true },
        synced_at: { type: Sequelize.DATE, allowNull: true },
        created_at: { type: Sequelize.DATE },
        updated_at: { type: Sequelize.DATE },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'shopify_catalog',
      },
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.shop_integrations, {
      foreignKey: 'id_shop_integration',
      as: 'shop',
    });
    this.belongsTo(models.products, {
      foreignKey: 'id_b4you_product',
      as: 'b4you_product',
    });
    this.belongsTo(models.product_offer, {
      foreignKey: 'id_b4you_offer',
      as: 'b4you_offer',
    });
  }
}

module.exports = Shopify_catalog;
