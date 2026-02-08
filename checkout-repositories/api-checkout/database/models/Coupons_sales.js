const Sequelize = require('sequelize');

class Coupons extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_coupon: {
          type: Sequelize.BIGINT,
        },
        id_sale: {
          type: Sequelize.BIGINT,
        },
        percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        paid: {
          type: Sequelize.BOOLEAN,
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'coupons_sales',
        createdAt: 'created_at',
        updatedAt: false,
        deletedAt: false,
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.coupons, {
      foreignKey: 'id_coupon',
      as: 'coupons_sales',
    });
  }
}

module.exports = Coupons;
