import * as Sequelize from 'sequelize';

export class Sales_items extends Sequelize.Model {
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
          allowNull: false,
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
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'sales_items',
      }
    );

    return this;
  }
}
