const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Coupons extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        coupon: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        uuid: {
          type: Sequelize.UUID,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        expires_at: {
          type: Sequelize.DATE,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        deleted_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        id_product: {
          type: Sequelize.BIGINT,
          references: {
            key: 'id',
            model: 'products',
          },
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        payment_methods: {
          type: Sequelize.STRING,
        },
        id_affiliate: {
          type: Sequelize.BIGINT,
          references: {
            key: 'id',
            model: 'affiliates',
          },
        },
        first_sale_only: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        single_use_by_client: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        restrict_offers: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        override_cookie: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        min_amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: null,
        },
        min_items: {
          type: Sequelize.INTEGER,
          defaultValue: null,
        },
        free_shipping: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        apply_on_every_charge: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        hooks: {
          beforeCreate: (coupon) => {
            coupon.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        sequelize,
        modelName: 'coupons',
        underscored: true,
        paranoid: true,
      },
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.coupons_sales, {
      foreignKey: 'id_coupon',
      sourceKey: 'id',
      as: 'coupons_sales',
    });
    this.belongsToMany(models.product_offer, {
      through: models.coupons_product_offers,
      foreignKey: 'id_coupon',
      otherKey: 'id_offer',
      as: 'offers',
    });
  }
}

module.exports = Coupons;
