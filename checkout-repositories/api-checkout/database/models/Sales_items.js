const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');
const { removeEmojis } = require('../../utils/validations');

class Sales_items extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUIDV4,
        },
        id_sale: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_plan: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_student: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        type: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        quantity: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
        price: {
          type: Sequelize.DECIMAL(20, 2),
          allowNull: false,
        },
        is_upsell: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        payment_method: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        paid_at: {
          type: Sequelize.DATE,
        },
        id_affiliate: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
        id_offer: {
          type: Sequelize.BIGINT,
          allowNull: true,
          defaultValue: null,
        },
        valid_refund_until: {
          type: Sequelize.DATE,
        },
        credit_card: {
          type: Sequelize.JSON,
        },
        upsell_url: {
          type: Sequelize.STRING,
        },
        tracking_code: {
          type: Sequelize.STRING,
        },
        tracking_url: {
          type: Sequelize.STRING,
        },
        tracking_company: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        src: {
          type: Sequelize.STRING,
        },
        sck: {
          type: Sequelize.STRING,
        },
        utm_source: {
          type: Sequelize.STRING,
        },
        utm_medium: {
          type: Sequelize.STRING,
        },
        utm_campaign: {
          type: Sequelize.STRING,
        },
        utm_content: {
          type: Sequelize.STRING,
        },
        utm_term: {
          type: Sequelize.STRING,
        },
        b1: {
          type: Sequelize.STRING,
        },
        b2: {
          type: Sequelize.STRING,
        },
        b3: {
          type: Sequelize.STRING,
        },
        id_classroom: {
          type: Sequelize.BIGINT,
        },
        price_product: {
          type: Sequelize.DECIMAL(10, 2),
        },
        price_base: {
          type: Sequelize.DECIMAL(10, 2),
        },
        price_total: {
          type: Sequelize.DECIMAL(10, 2),
        },
        split_price: {
          type: Sequelize.DECIMAL(10, 2),
        },
        subscription_fee: {
          type: Sequelize.DECIMAL(10, 2),
        },
        shipping_price: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_fixed: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_total: {
          type: Sequelize.DECIMAL(10, 2),
        },
        id_subscription: {
          type: Sequelize.BIGINT,
        },
        discount_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        discount_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        revenue: {
          type: Sequelize.DECIMAL(10, 2),
        },
        interest_installment_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        interest_installment_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        company_gross_profit_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        company_net_profit_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        tax_fee_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        tax_fee_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        tax_interest_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        tax_interest_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        tax_total: {
          type: Sequelize.DECIMAL(10, 2),
        },
        spread_over_price_product: {
          type: Sequelize.DECIMAL(10, 2),
        },
        spread_over_price_total: {
          type: Sequelize.DECIMAL(10, 2),
        },
        monthly_installment_interest: {
          type: Sequelize.DECIMAL(10, 2),
        },
        original_price: {
          type: Sequelize.DECIMAL(10, 2),
        },
        customer_paid_interest: {
          type: Sequelize.BOOLEAN,
        },
        integration_shipping_company: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
        },
        list: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        hooks: {
          beforeCreate: (saleItem) => {
            saleItem.uuid = uuid.v4();
            if (saleItem.utm_source) {
              saleItem.utm_source = removeEmojis(saleItem.utm_source);
            }
            if (saleItem.sck) {
              saleItem.sck = removeEmojis(saleItem.sck);
            }
            if (saleItem.scr) {
              saleItem.scr = removeEmojis(saleItem.scr);
            }
            if (saleItem.utm_medium) {
              saleItem.utm_medium = removeEmojis(saleItem.utm_medium);
            }
            if (saleItem.utm_campaign) {
              saleItem.utm_campaign = removeEmojis(saleItem.utm_campaign);
            }
            if (saleItem.utm_content) {
              saleItem.utm_content = removeEmojis(saleItem.utm_content);
            }
            if (saleItem.utm_term) {
              saleItem.utm_term = removeEmojis(saleItem.utm_term);
            }
            if (saleItem.b1) {
              saleItem.b1 = removeEmojis(saleItem.b1);
            }
            if (saleItem.b2) {
              saleItem.b2 = removeEmojis(saleItem.b2);
            }
            if (saleItem.b3) {
              saleItem.b3 = removeEmojis(saleItem.b3);
            }
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'sales_items',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.products, {
      foreignKey: 'id',
      sourceKey: 'id_product',
      as: 'product',
    });
    this.hasOne(models.students, {
      foreignKey: 'id',
      sourceKey: 'id_student',
      as: 'student',
    });
    this.hasOne(models.product_plans, {
      foreignKey: 'id',
      sourceKey: 'id_plan',
      as: 'plan',
    });
    this.hasOne(models.affiliates, {
      foreignKey: 'id',
      sourceKey: 'id_affiliate',
      as: 'affiliate',
    });
    this.hasOne(models.subscriptions, {
      foreignKey: 'id_sale_item',
      as: 'subscription',
    });
    this.hasOne(models.refunds, {
      foreignKey: 'id_sale_item',
      as: 'refund',
    });
    this.belongsTo(models.sales, {
      foreignKey: 'id_sale',
      as: 'sale',
    });
    this.hasOne(models.product_offer, {
      foreignKey: 'id',
      sourceKey: 'id_offer',
      as: 'offer',
    });
    this.hasOne(models.coupons_sales, {
      sourceKey: 'id_sale',
      foreignKey: 'id_sale',
      as: 'coupon_sale',
    });
    this.hasMany(models.commissions, {
      foreignKey: 'id_sale_item',
      as: 'commissions',
    });
    this.belongsToMany(models.charges, {
      through: models.sales_items_charges,
      foreignKey: 'id_sale_item',
      as: 'charges',
    });
  }
}

module.exports = Sales_items;
