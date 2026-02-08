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
        is_upsell_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
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
        terms: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        url_terms: {
          type: Sequelize.STRING,
        },
        payment_methods: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        student_pays_interest: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        shipping_type: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        banner_image: {
          type: Sequelize.STRING,
        },
        banner_image_key: {
          type: Sequelize.STRING,
        },
        banner_image_secondary: {
          type: Sequelize.STRING,
        },
        banner_image_secondary_key: {
          type: Sequelize.STRING,
        },
        banner_image_mobile: {
          type: Sequelize.STRING,
        },
        banner_image_mobile_key: {
          type: Sequelize.STRING,
        },
        banner_image_mobile_secondary: {
          type: Sequelize.STRING,
        },
        banner_image_mobile_secondary_key: {
          type: Sequelize.STRING,
        },
        sidebar_image: {
          type: Sequelize.STRING,
        },
        sidebar_image_key: {
          type: Sequelize.STRING,
        },
        shipping_price: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        url_video_checkout: {
          type: Sequelize.TEXT,
        },
        require_address: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        counter: {
          type: Sequelize.JSON,
          defaultValue: {},
        },
        uuid_offer_back_redirect: {
          type: Sequelize.STRING,
        },
        hide: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        affiliate_visible: {
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
        id_shopify: {
          type: Sequelize.STRING,
        },
        metadata: {
          type: Sequelize.JSON,
          defaultValue: null,
        },
        offer_image: {
          type: Sequelize.JSON,
          defaultValue: null,
        },
        alternative_name: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        checkout_customizations: {
          type: Sequelize.JSON,
          defaultValue: null,
        },
        type_exibition_value: {
          type: Sequelize.TINYINT,
          defaultValue: 0,
        },
        allow_shipping_region: {
          type: Sequelize.TINYINT,
          defaultValue: 0,
        },
        shipping_text: {
          type: Sequelize.STRING,
          defaultValue: null,
        },
        shipping_price_no: {
          type: Sequelize.DECIMAL,
          allowNull: true,
          defaultValue: 0,
        },
        shipping_price_ne: {
          type: Sequelize.DECIMAL,
          allowNull: true,
          defaultValue: 0,
        },
        shipping_price_co: {
          type: Sequelize.DECIMAL,
          allowNull: true,
          defaultValue: 0,
        },
        shipping_price_so: {
          type: Sequelize.DECIMAL,
          allowNull: true,
          defaultValue: 0,
        },
        shipping_price_su: {
          type: Sequelize.DECIMAL,
          allowNull: true,
          defaultValue: 0,
        },
        bling_sku: {
          type: Sequelize.STRING,
          defaultValue: null,
          allowNull: true,
        },
        allow_coupon: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        counter_three_steps: {
          type: Sequelize.JSON,
          defaultValue: {},
        },
        popup: {
          type: Sequelize.JSON,
          defaultValue: {},
        },
        dimensions: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        default_installment: {
          type: Sequelize.INTEGER,
        },
        show_cnpj: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        enable_two_cards_payment: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        is_upsell_native: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
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
    this.belongsToMany(models.coupons, {
      through: models.coupons_product_offers,
      foreignKey: 'id_offer',
      otherKey: 'id_coupon',
      as: 'coupons',
    });
  }
}

module.exports = Product_offer;