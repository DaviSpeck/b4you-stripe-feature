const Sequelize = require('sequelize');

class Withdrawals_settings_default extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        free_month_withdrawal: {
          type: Sequelize.INTEGER,
          defaultValue: 4,
        },
        max_daily_withdrawal: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
        },
        max_amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 2000,
        },
        min_amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 5,
        },
        fee_fixed: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 3,
        },
        withheld_balance_percentage: {
          type: Sequelize.DECIMAL(10, 2),
        },
        fee_variable: {
          type: Sequelize.DECIMAL(14, 2),
        },
        use_highest_sale: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'withdrawals_settings_default',
      },
    );

    return this;
  }
}

module.exports = Withdrawals_settings_default;
