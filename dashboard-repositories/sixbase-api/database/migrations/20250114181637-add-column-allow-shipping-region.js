/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('product_offer','allow_shipping_region',{
      type: Sequelize.TINYINT,
      allowNull: true,
      defaultValue: 0,
    })
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('product_offer','allow_shipping_region');
  }
};