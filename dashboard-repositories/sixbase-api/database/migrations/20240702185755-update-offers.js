/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('product_offer', 'toggle_commission', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn('product_offer', 'affiliate_commission', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('product_offer', 'toggle_commission'),
      queryInterface.removeColumn('product_offer', 'affiliate_commission'),
    ]);
  },
};
