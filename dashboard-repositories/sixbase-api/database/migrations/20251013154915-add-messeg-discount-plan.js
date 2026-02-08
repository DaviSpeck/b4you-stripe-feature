/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'product_offer',
      'is_plan_discount_message',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'product_offer',
      'is_plan_discount_message',
    );
  },
};
