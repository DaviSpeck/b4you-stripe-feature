import * as Sequelize from 'sequelize';
import { date } from '../../utils/date.mjs';

export class Balances extends Sequelize.Model {
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
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0,
        },
        created_at: {
          type: Sequelize.BIGINT,
        },
        updated_at: {
          type: Sequelize.BIGINT,
          allowNull: true,
        },
      },
      {
        hooks: {
          beforeBulkUpdate: (balance) => {
            balance.updated_at = date().toUnix();
          },
        },
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'balances',
      }
    );

    return this;
  }
}
