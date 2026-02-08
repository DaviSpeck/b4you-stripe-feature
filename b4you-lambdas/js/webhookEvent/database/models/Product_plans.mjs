import * as Sequelize from 'sequelize';

export class Product_plans extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        uuid: {
          type: Sequelize.UUID,
          unique: true,
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        price: {
          type: Sequelize.DECIMAL(20, 2),
          allowNull: false,
        },
        subscription_fee_price: {
          type: Sequelize.DECIMAL(20, 2),
          defaultValue: 0,
        },
        subscription_fee: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        charge_first: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        label: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        payment_frequency: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        frequency_quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        frequency_label: {
          type: Sequelize.STRING(10),
          allowNull: false,
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
        paranoid: true,
        sequelize,
        modelName: 'product_plans',
        underscored: true,
      }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.subscriptions, {
      sourceKey: 'id',
      foreignKey: 'id_plan',
      as: 'subscriptions',
    });
  }
}
