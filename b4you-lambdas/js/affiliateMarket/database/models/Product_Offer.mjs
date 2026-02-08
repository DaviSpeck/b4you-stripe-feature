import * as Sequelize from 'sequelize';
import { Offer_plans } from './Offer_plans.mjs';
export class Product_offer extends Sequelize.Model {
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
        quantity: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
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
        affiliate_visible: {
          type: Sequelize.BOOLEAN,
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
        shipping_type: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        shipping_price: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        require_address: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        counter: {
          type: Sequelize.JSON,
          defaultValue: {},
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
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        paranoid: true,
        sequelize,
        modelName: 'product_offer',
      }
    );

    return this;
  }
  static associate(models) {
    this.belongsToMany(models.product_plans, {
      through: Offer_plans,
      foreignKey: 'id_offer',
      otherKey: 'id_plan',
      as: 'plans',
    });
  }
}
