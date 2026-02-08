import * as Sequelize from 'sequelize';

export class BalanceHistory extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_transaction: {
          type: Sequelize.BIGINT,
        },
        operation: {
          type: Sequelize.STRING,
        },
        old_amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        new_amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        sequelize,
        modelName: 'balance_history',
      }
    );

    return this;
  }
}
