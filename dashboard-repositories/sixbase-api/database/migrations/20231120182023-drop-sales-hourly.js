/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line
  async up(queryInterface, Sequelize) {
    await queryInterface.dropTable('sales_metrics_hourly');
  },

  // eslint-disable-next-line
  async down(queryInterface, Sequelize) {},
};
