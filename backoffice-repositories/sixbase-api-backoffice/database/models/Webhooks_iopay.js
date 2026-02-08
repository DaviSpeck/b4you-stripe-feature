const Sequelize = require('sequelize');

class Webhooks_iopay extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        payload: {
          type: Sequelize.JSON,
        },
        created_at: {
          type: Sequelize.DATE,
        },
      },
      {
        freezeTableName: true,
        timestamps: true,
        createdAt: 'created_at',
        deletedAt: false,
        updatedAt: false,
        sequelize,
        modelName: 'webhooks_iopay',
      },
    );

    return this;
  }
}

module.exports = Webhooks_iopay;
