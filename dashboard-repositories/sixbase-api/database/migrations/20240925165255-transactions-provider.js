/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('withdrawals', 'provider', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('withdrawals', 'provider');
  },
};
