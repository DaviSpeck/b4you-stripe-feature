/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('onboarding', 'origem_other', {
      type: Sequelize.STRING,
      defaultValue: null,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('onboarding', 'origem_other');
  },
};
