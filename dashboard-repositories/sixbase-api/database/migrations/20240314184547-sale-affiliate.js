/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('sales', 'id_invoice_affiliate', {
        type: Sequelize.BIGINT,
        defaultValue: null,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('sales', 'id_invoice_affiliate'),
    ]);
  },
};
