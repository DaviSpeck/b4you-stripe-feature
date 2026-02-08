const Sequelize = require('sequelize');

class IntegrationNotifications extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
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
        },
        id_type: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: '1=webhook, 2=bling, 3=notazz, 4=refund, 5=shopify',
        },
        id_sale: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        params: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        read_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'integration_notifications',
        indexes: [
          {
            fields: ['id_user'],
          },
          {
            fields: ['id_type'],
          },
          {
            fields: ['id_action'],
          },
          {
            fields: ['id_sale'],
          },
          {
            fields: ['id_sale_item'],
          },
          {
            fields: ['id_product'],
          },
          {
            fields: ['read'],
          },
          {
            fields: ['created_at'],
          },
        ],
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.users, {
      foreignKey: 'id_user',
      as: 'user',
    });
    this.hasOne(models.sales, {
      foreignKey: 'id',
      sourceKey: 'id_sale',
      as: 'sale',
    });
    this.hasOne(models.sales_items, {
      foreignKey: 'id',
      sourceKey: 'id_sale_item',
      as: 'sale_item',
    });
    this.hasOne(models.products, {
      foreignKey: 'id',
      sourceKey: 'id_product',
      as: 'product',
    });
  }
}

module.exports = IntegrationNotifications;
