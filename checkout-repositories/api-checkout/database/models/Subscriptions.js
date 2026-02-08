const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Subscriptions extends Sequelize.Model {
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
          unique: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_student: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_sale_item: {
          type: Sequelize.BIGINT,
        },
        id_affiliate: {
          type: Sequelize.BIGINT,
        },
        affiliate_commission: {
          type: Sequelize.DECIMAL(10, 2),
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_sale: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        id_status: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        next_charge: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        valid_until: {
          type: Sequelize.DATEONLY,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        id_plan: {
          type: Sequelize.BIGINT,
        },
        credit_card: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        payment_method: {
          type: Sequelize.STRING,
          defaultValue: 'card',
        },
        renew: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        last_notify: {
          type: Sequelize.DATEONLY,
          defaultValue: null,
        },
        canceled_at: {
          type: Sequelize.DATE,
        },
        next_attempt: {
          type: Sequelize.DATEONLY,
        },
        attempt_count: {
          type: Sequelize.BIGINT,
          defaultValue: 0,
        },
        id_coupon: {
          type: Sequelize.BIGINT,
          defaultValue: null,
          allowNull: true,
        },
      },
      {
        hooks: {
          beforeCreate: (subscription) => {
            subscription.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        sequelize,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        modelName: 'subscriptions',
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.users, {
      foreignKey: 'id',
      sourceKey: 'id_user',
      as: 'producer',
    });
    this.hasOne(models.products, {
      foreignKey: 'id',
      sourceKey: 'id_product',
      as: 'product',
    });
    this.hasOne(models.product_plans, {
      foreignKey: 'id',
      sourceKey: 'id_plan',
      as: 'plan',
    });
    this.hasOne(models.students, {
      foreignKey: 'id',
      sourceKey: 'id_student',
      as: 'student',
    });
    this.hasOne(models.sales_items, {
      foreignKey: 'id',
      sourceKey: 'id_sale_item',
      as: 'sales_item',
    });
    this.hasMany(models.charges, {
      foreignKey: 'id_subscription',
      as: 'charges',
    });
    this.belongsTo(models.sales_items, {
      foreignKey: 'id_sale_item',
      as: 'sale_item',
    });
    this.hasMany(models.sales_items, {
      foreignKey: 'id_subscription',
      as: 'sales_items',
    });
  }
}

module.exports = Subscriptions;
