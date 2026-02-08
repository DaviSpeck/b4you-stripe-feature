/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sales', 'id_invoice_supplier', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('sales', 'id_invoice_supplier');
  },
};
