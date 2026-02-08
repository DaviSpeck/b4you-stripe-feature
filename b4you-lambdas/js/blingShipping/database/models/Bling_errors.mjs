import * as Sequelize from 'sequelize';

export class Bling_errors extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        id_sale: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_user: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        resent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        reason: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        sequelize,
        createdAt: 'created_at',
        updatedAt: false,
        deletedAt: false,
        modelName: 'bling_errors',
      }
    );

    return this;
  }
}
