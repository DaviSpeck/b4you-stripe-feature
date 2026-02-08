/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn(
        'sales_metrics_daily',
        'chargeback_dispute_total',
        {
          type: Sequelize.DECIMAL(20, 2),
          defaultValue: 0,
        },
      ),
      queryInterface.addColumn(
        'sales_metrics_daily',
        'chargeback_dispute_count',
        {
          type: Sequelize.BIGINT,
          defaultValue: 0,
        },
      ),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn(
        'sales_metrics_daily',
        'chargeback_dispute_total',
      ),
      queryInterface.removeColumn(
        'sales_metrics_daily',
        'chargeback_dispute_count',
      ),
    ]);
  },
};
