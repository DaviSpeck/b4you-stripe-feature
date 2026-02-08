/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn('product_offer','offer_image',{
      type: Sequelize.STRING,
      defaultValue: null,
    })
  },

  async down (queryInterface) {

    await queryInterface.removeColumn('product_offer','offer_image');
  }
};