const Sequelize = require('sequelize');

module.exports = class Provider_events_history extends Sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        event_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        provider: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        event_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        event_action: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        occurred_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        transaction_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        order_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        sale_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        payload: {
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
        modelName: 'provider_events_history',
        indexes: [
          {
            unique: true,
            fields: ['provider', 'event_id'],
          },
        ],
      },
    );

    return this;
  }
};
