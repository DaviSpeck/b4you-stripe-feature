const Sequelize = require('sequelize');
const Offer_plans = require('./Offer_plans');
const uuid = require('../../utils/helpers/uuid');

class Product_offer extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        id_product: {
          type: Sequelize.INTEGER,
        },
        id_classroom: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        name: {
          type: Sequelize.STRING,
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
        },
        discount_pix: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        discount_billet: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        discount_card: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        sales_page_url: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        allow_affiliate: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        uuid: {
          type: Sequelize.UUIDV4,
          unique: true,
        },
        id_upsell: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        start_offer: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        end_offer: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        thankyou_page: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        thankyou_page_upsell: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        installments: {
          allowNull: true,
          type: Sequelize.INTEGER,
        },
        payment_methods: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        student_pays_interest: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        hide: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
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
          beforeCreate: (offer) => {
            offer.uuid = uuid.nanoid(10);
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        paranoid: true,
        sequelize,
        modelName: 'product_offer',
      },
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.products, {
      foreignKey: 'id',
      sourceKey: 'id_product',
      as: 'product',
    });
    this.hasOne(models.products, {
      foreignKey: 'id',
      sourceKey: 'id_product',
      as: 'offer_product',
    });
    this.hasOne(models.product_offer, {
      foreignKey: 'id',
      sourceKey: 'id_upsell',
      as: 'upsell',
    });
    this.hasOne(models.classrooms, {
      foreignKey: 'id',
      sourceKey: 'id_classroom',
      as: 'classroom',
    });
    this.hasMany(models.order_bumps, {
      foreignKey: 'id_offer',
      as: 'order_bumps',
    });
    this.belongsToMany(models.product_plans, {
      through: Offer_plans,
      foreignKey: 'id_offer',
      otherKey: 'id_plan',
      as: 'plans',
    });
  }
}

module.exports = Product_offer;
