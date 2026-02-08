/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'company_bank_code', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.addColumn('users', 'company_agency', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.addColumn('users', 'company_account_number', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
    await queryInterface.addColumn('users', 'company_account_type', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'company_bank_code');
    await queryInterface.removeColumn('users', 'company_agency');
    await queryInterface.removeColumn('users', 'company_account_number');
    await queryInterface.removeColumn('users', 'company_account_type');
  },
};
