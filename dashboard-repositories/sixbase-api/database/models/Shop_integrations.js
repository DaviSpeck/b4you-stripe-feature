const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Shop_integrations extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        platform: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: 'shopify',
        },
        shop_domain: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        shop_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
          allowNull: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        config: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_default_offer: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        access_token: {
          type: Sequelize.STRING(512),
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (shopIntegration) => {
            shopIntegration.uuid = uuid.nanoid(16);
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        paranoid: true,
        sequelize,
        modelName: 'shop_integrations',
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.users, {
      foreignKey: 'id_user',
      as: 'user',
    });
    this.belongsTo(models.products, {
      foreignKey: 'id_product',
      as: 'container_product',
    });
    this.belongsTo(models.product_offer, {
      foreignKey: 'id_default_offer',
      as: 'default_offer',
    });
    this.hasMany(models.shopify_catalog, {
      foreignKey: 'id_shop_integration',
      as: 'shopify_catalog',
    });
  }
}

module.exports = Shop_integrations;
