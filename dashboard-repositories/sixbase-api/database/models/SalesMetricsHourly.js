const Sequelize = require('sequelize');

module.exports = class SalesMetricsHourly extends Sequelize.Model {
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
          references: {
            model: 'users',
            key: 'id',
          },
        },
        id_product: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
        },
        pending_count: {
          type: Sequelize.BIGINT,
          defaultValue: 0,
        },
        pending_total: {
          type: Sequelize.DECIMAL(20, 2),
          defaultValue: 0,
        },
        paid_count: {
          type: Sequelize.BIGINT,
          defaultValue: 0,
        },
        paid_total: {
          type: Sequelize.DECIMAL(20, 2),
          defaultValue: 0,
        },
        refunded_count: {
          type: Sequelize.BIGINT,
          defaultValue: 0,
        },
        refunded_total: {
          type: Sequelize.DECIMAL(20, 2),
          defaultValue: 0,
        },
        chargeback_count: {
          type: Sequelize.BIGINT,
          defaultValue: 0,
        },
        chargeback_total: {
          type: Sequelize.DECIMAL(20, 2),
          defaultValue: 0,
        },
        denied_count: {
          type: Sequelize.BIGINT,
          defaultValue: 0,
        },
        denied_total: {
          type: Sequelize.DECIMAL(20, 2),
          defaultValue: 0,
        },
        time: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'sales_metrics_hourly',
      },
    );
    return this;
  }
};
