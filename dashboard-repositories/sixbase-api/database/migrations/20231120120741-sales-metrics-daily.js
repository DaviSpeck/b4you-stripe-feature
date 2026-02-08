/** @type {import('sequelize-cli').Migration} Migration */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sales_metrics_daily', {
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
    });
    await queryInterface.addIndex(
      'sales_metrics_daily',
      ['id_user', 'id_product', 'time'],
      { name: 'idx_user_product_time', unique: true },
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('sales_metrics_daily');
    await queryInterface.removeIndex(
      'sales_metrics_daily',
      'idx_user_product_time',
    );
  },
};
