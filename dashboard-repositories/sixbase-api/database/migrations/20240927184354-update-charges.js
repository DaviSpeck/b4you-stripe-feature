/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('charges', 'provider_response_details', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('charges', 'provider_response_details');
  },
};
