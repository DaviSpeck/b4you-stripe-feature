const Sequelize = require('sequelize');

module.exports = class Suppliers_Product extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          primaryKey: true,
          autoIncrement: true,
          type: Sequelize.BIGINT,
        },
        id_user: {
          type: Sequelize.BIGINT,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        id_status: {
          type: Sequelize.TINYINT,
        },
        id_product: {
          type: Sequelize.BIGINT,
          references: {
            model: 'products',
            key: 'id',
          },
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        receives_shipping_amount: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
        deleted_at: Sequelize.DATE,
        accepted_at: Sequelize.DATE,
        rejected_at: Sequelize.DATE,
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        sequelize,
        modelName: 'suppliers_product',
        paranoid: true,
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'user',
    });
    this.hasOne(models.products, {
      foreignKey: 'id',
      sourceKey: 'id_product',
      as: 'product',
    });
  }
};
