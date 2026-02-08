const Sequelize = require('sequelize');

module.exports = class Webhooks_logs extends Sequelize.Model {
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
      },
    );

    return this;
  }

  static associate(models) {
    this.hasOne(models.webhooks, {
      sourceKey: 'id_webhook',
      foreignKey: 'id',
      as: 'webhook',
    });
  }
};
