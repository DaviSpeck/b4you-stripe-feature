import * as Sequelize from 'sequelize';

export class Webhooks_logs extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_webhook: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        id_event: {
          type: Sequelize.INTEGER,
          defaultValue: null,
          allowNull: true,
        },
        body: {
          type: Sequelize.JSON,
        },
        tries: {
          type: Sequelize.INTEGER,
        },
        success: {
          type: Sequelize.BOOLEAN,
        },
        response_status: {
          type: Sequelize.STRING,
        },
        created_at: {
          type: Sequelize.DATE,
        },
        updated_at: {
          type: Sequelize.DATE,
        },
        sent_at: Sequelize.DATE,
      },
      {
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        sequelize,
        modelName: 'webhooks_logs',
      }
    );

    return this;
  }
}
