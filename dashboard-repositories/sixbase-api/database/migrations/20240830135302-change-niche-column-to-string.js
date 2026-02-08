/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('onboarding', 'nicho', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('onboarding', 'nicho', {
      type: Sequelize.SMALLINT,
      allowNull: true,
    });
  },
};
