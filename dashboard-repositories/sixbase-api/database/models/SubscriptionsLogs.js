const Sequelize = require('sequelize');

class SubscriptionsLogs extends Sequelize.Model {
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
          references: {
            model: 'subscriptions',
            key: 'id',
          },
        },
        action: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        email_type: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        email_sent_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        canceled_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        mailjet_message_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        mailjet_message_uuid: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        mailjet_status: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        mailjet_response: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        details: {
          type: Sequelize.JSON,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'subscriptions_logs',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.subscriptions, {
      foreignKey: 'id_subscription',
      as: 'subscription',
    });
  }
}

module.exports = SubscriptionsLogs;
