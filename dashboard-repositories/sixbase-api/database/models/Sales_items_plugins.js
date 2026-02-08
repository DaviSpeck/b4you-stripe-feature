const Sequelize = require('sequelize');

class Sales_items_plugins extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_bling: {
          type: Sequelize.STRING,
          defaultValue: null,
          allowNull: true,
        },
        id_tiny: {
          type: Sequelize.STRING,
          defaultValue: null,
          allowNull: true,
        },
        id_shopify: {
          type: Sequelize.STRING,
          defaultValue: null,
          allowNull: true,
        },
        id_notazz: {
          type: Sequelize.STRING,
          defaultValue: null,
          allowNull: true,
        },
        body: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        response: {
          type: Sequelize.JSON,
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
        modelName: 'sales_items_plugins',
      },
    );

    return this;
  }
}
module.exports = Sales_items_plugins;
