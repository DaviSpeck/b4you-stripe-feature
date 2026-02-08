/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sales_blacklist', 'antifraud_response', {
      type: Sequelize.JSON,
    });
    await queryInterface.addColumn('sales_blacklist', 'transaction_id', {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sales_blacklist', 'antifraud_response');
    await queryInterface.removeColumn('sales_blacklist', 'transaction_id');
  },
};
