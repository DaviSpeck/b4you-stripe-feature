import * as Sequelize from 'sequelize';

export class Subscriptions extends Sequelize.Model {
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
      },
      {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        modelName: 'subscriptions',
      }
    );

    return this;
  }
  static associate(models) {
    this.hasOne(models.product_plans, {
      foreignKey: 'id',
      sourceKey: 'id_plan',
      as: 'plan',
    });
  }
}
