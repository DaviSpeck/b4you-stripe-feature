/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'products',
      'available_checkout_link_types',
      {
        type: Sequelize.INTEGER,
        defaultValue: 3,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'products',
      'available_checkout_link_types',
    );
  },
};
