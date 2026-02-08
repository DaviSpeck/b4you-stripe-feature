const Sequelize = require('sequelize');

class Coupons_product_offers extends Sequelize.Model {
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
          allowNull: false,
        },
        id_offer: {
          type: Sequelize.BIGINT,
          allowNull: false,
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
        sequelize,
        modelName: 'coupons_product_offers',
        underscored: true,
      },
    );

    return this;
  }
}

module.exports = Coupons_product_offers;

