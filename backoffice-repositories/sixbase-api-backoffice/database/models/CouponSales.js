const Sequelize = require('sequelize');

module.exports = class CouponSales extends Sequelize.Model {
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
        paid: {
          type: Sequelize.BOOLEAN,
        },
        created_at: Sequelize.DATE,
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        sequelize,
        modelName: 'coupons_sales',
      },
    );

    
    return this;
  }

  static associate(models) {
      this.hasOne(models.coupons, {
        sourceKey: 'id_coupon',
        foreignKey: 'id',
        as: 'coupon'
      })
    }

}

