import * as Sequelize from 'sequelize';

export class Withdrawals_settings extends Sequelize.Model {
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
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        free_month_withdrawal: {
          type: Sequelize.INTEGER,
        },
        max_daily_withdrawal: {
          type: Sequelize.INTEGER,
        },
        max_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        min_amount: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_fixed: {
          type: Sequelize.DECIMAL(10, 2),
        },
        withheld_balance_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable: {
          type: Sequelize.DECIMAL(14, 2),
        },
        blocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        lock_pending: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        use_highest_sale: {
          type: Sequelize.BOOLEAN,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'withdrawals_settings',
      }
    );

    return this;
  }
}
