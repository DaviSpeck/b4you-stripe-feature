/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DELETE FROM checkout_info');

    await queryInterface.addColumn('checkout_info', 'uuid', {
      type: Sequelize.UUID,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('checkout_info', 'uuid');
  },
};
