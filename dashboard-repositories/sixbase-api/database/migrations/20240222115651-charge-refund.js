/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('charges', 'refund_amount', {
      type: Sequelize.DECIMAL(20, 2),
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('charges', 'refund_amount');
  },
};
