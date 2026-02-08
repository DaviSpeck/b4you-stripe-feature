/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_offer', 'shipping_price_no', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: true,
    });
    await queryInterface.addColumn('product_offer', 'shipping_price_ne', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: true,
    });
    await queryInterface.addColumn('product_offer', 'shipping_price_co', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: true,
    });
    await queryInterface.addColumn('product_offer', 'shipping_price_so', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: true,
    });
    await queryInterface.addColumn('product_offer', 'shipping_price_su', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('product_offer', 'shipping_price_no');
    await queryInterface.removeColumn('product_offer', 'shipping_price_ne');
    await queryInterface.removeColumn('product_offer', 'shipping_price_co');
    await queryInterface.removeColumn('product_offer', 'shipping_price_so');
    await queryInterface.removeColumn('product_offer', 'shipping_price_su');
  },
};
