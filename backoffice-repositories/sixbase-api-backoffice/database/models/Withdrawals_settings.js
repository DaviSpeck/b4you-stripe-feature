const Sequelize = require('sequelize');
const uuid = require('../../utils/helpers/uuid');

class Withdrawals_settings extends Sequelize.Model {
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
        use_highest_sale: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        auto_block_enabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          comment: 'Define se o bloqueio automático de saldo está habilitado para o usuário',
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
      },
      {
        hooks: {
          beforeCreate: (withdrawals_settings) => {
            withdrawals_settings.uuid = uuid.v4();
          },
        },
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        modelName: 'withdrawals_settings',
      },
    );

    return this;
  }
}

module.exports = Withdrawals_settings;
