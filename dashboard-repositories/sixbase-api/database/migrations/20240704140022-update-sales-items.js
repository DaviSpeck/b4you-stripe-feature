/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('sales_items', 'list', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
      queryInterface.addColumn('sales_items', 'id_parent', {
        type: Sequelize.BIGINT,
        defaultValue: null,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('sales_items', 'list'),
      queryInterface.removeColumn('sales_items', 'id_parent'),
    ]);
  },
};
