/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_offer', 'metadata', {
      type: Sequelize.JSON,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('product_offer', 'metadata');
  },
};
