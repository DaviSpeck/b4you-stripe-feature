import * as Sequelize from 'sequelize';

export class Product_affiliate_settings extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        manual_approve: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        email_notification: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        show_customer_details: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        support_email: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        general_rules: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        commission: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 1,
        },
        subscription_fee: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        subscription_fee_only: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        subscription_fee_commission: {
          type: Sequelize.DECIMAL(10, 2),
        },
        commission_all_charges: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        click_attribution: {
          type: Sequelize.INTEGER,
        },
        cookies_validity: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        url_promotion_material: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
        allow_access: { type: Sequelize.BOOLEAN, defaultValue: false },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'product_affiliate_settings',
      }
    );

    return this;
  }
}
