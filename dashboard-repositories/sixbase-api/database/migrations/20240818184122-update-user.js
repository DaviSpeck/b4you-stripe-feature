/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('users', 'verified_pagarme', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      }),
      queryInterface.addColumn('users', 'verified_company_pagarme', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      }),
    ]);
  },

  async down(queryInterface) {
    await Promise.all([
      queryInterface.removeColumn('users', 'verified_pagarme'),
      queryInterface.removeColumn('users', 'verified_company_pagarme'),
    ]);
  },
};
