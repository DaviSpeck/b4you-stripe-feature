/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('invoices', 'id_sale', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('invoices', 'id_transaction', {
        type: Sequelize.BIGINT,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([queryInterface.removeColumn('invoices', 'id_sale')]);
  },
};
