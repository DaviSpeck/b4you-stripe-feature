/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_offer', 'type_exibition_value', {
      type: Sequelize.TINYINT,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('product_offer', 'type_exibition_value');
  },
};
