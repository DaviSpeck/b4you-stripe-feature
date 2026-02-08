import * as Sequelize from 'sequelize';

export class SubscriptionsLogs extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        id_subscription: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        action: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        details: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        email_type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        email_sent_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        mailjet_message_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        mailjet_message_uuid: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        mailjet_status: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        mailjet_response: {
          type: Sequelize.JSON,
          allowNull: true,
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
        sequelize,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        modelName: 'subscriptions_logs',
      }
    );

    return this;
  }

  static async associate(models) {
    this.belongsTo(models.subscriptions, {
      as: 'subscription',
      foreignKey: 'id_subscription',
    });
  }
}
